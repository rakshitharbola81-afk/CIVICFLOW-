const Complaint = require('../models/Complaint');
const {uploadToCloudinary}=require('../config/cloudinaryConfig');
const {analyzeComplaintImage}=require('../utils/groqClient');
const {sendComplaintEmail}=require('../utils/email');
const catchAsync=require('../utils/catchAsync');
const AppError=require('../utils/appError');
const AuditLog=require('../models/AuditLog');

exports.createComplaint=catchAsync(async(req,res,next)=>{
    const {title,description,address,longitude,latitude}=req.body;
    if(!req.file){
        return next(new AppError('Please upload an image off the complaint issue.',400))
    }
    const cloudinaryResult=await uploadToCloudinary(req.file.buffer);
    const aiAnalysis=await analyzeComplaintImage(cloudinaryResult.url,description);
    const newComplaint = await Complaint.create({
        title,
        description:description || aiAnalysis.analysis,
        category:aiAnalysis.category,
        priority:aiAnalysis.priority,
        citizen:req.user._id,
        location:{
            type:'Point',
            coordinates:[longitude||0,latitude||0],
            address:address
        },
        images:{
            beforeUrl:cloudinaryResult.url,
            beforePublicId:cloudinaryResult.publicId
        },
        aiMetadata:{
            aiSuggestedCategory:aiAnalysis.category,
            aiSuggestedPriority:aiAnalysis.priority,
            analyzedAt:new Date()
        }
    })
    const emailBody = aiAnalysis.emailBody
        .replace(/\[Location\]/g, address || 'Not specified')
        .replace(/\[Complaint ID\]/g, newComplaint._id)
        .replace(/\[Your Name\]/g, 'CivicFlow AI System');
    const emailHtmlContent = `
    <h3>New Civic Complaint Registered via CivicFlow AI</h3>
    <p><strong>Complaint ID:</strong> ${newComplaint._id}</p>
    <p><strong>Category:</strong> ${newComplaint.category} (${newComplaint.priority} Priority)</p>
    <p><strong>Location:</strong> ${address || 'Not specified'}</p>
    <hr />
    <p>${aiAnalysis.emailBody.replace(/\n/g, '<br>')}</p> 
    <hr />
    <p><strong>Evidence Image:</strong> <br><img src="${cloudinaryResult.url}" width="400" /></p>
  `;
    await sendComplaintEmail({
        email: process.env.DEMO_AUTHORITY_EMAIL, 
        subject: `[${newComplaint.priority}] New ${newComplaint.category} Report #${newComplaint.title}`,
        html: emailHtmlContent
    });
    res.status(201).json({
        status: 'success',
        message: 'Complaint registered successfully and authority notified via AI mail.',
        data: {
            complaint: newComplaint
        }
    });
});

exports.assignWorker = catchAsync(async (req, res, next) => {
    const { complaintId, workerId } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return next(new AppError('No complaint found with that ID.', 404));

    if (complaint.status !== 'Pending') {
        return next(new AppError(`Cannot assign a complaint that is already '${complaint.status}'.`, 400));
    }

    complaint.status = 'Assigned';
    complaint.assignedWorker = workerId;
    complaint.assignedAt = new Date();
    await complaint.save();

    await AuditLog.create({
        complaintId: complaintId,
        performedBy: req.user._id,
        action: 'STATUS_CHANGE',
        fromStatus: 'Pending',
        toStatus: 'Assigned',
        comment: `Complaint successfully assigned to Worker ID: ${workerId} by Admin.`
    });

    res.status(200).json({
        status: 'success',
        message: 'Complaint successfully assigned to the worker and logged in history.',
        data: { complaint }
    });
});

exports.markInProgress=catchAsync(async(req,res,next)=>{
    const complaint = await Complaint.findById(req.params.id);
    if(!complaint){
        return next(new AppError('No complaint found with that ID.',404));
    }
    if(complaint.assignedWorker.toString()!==req.user._id.toString()){
        return next(new AppError('This complaint is not assigned to you.',403));
    }
    const previousStatus=complaint.status;
    complaint.status='In Progress';
    await complaint.save();
    await AuditLog.create({
        complaintId: complaint._id,
        performedBy: req.user._id,
        action: 'STATUS_CHANGE',
        fromStatus: previousStatus,
        toStatus: 'In Progress',
        comment: `Worker ${req.user.name} has started working on this complaint.`
    });
    res.status(200).json({
        status: 'success',
        message: 'Complaint marked as In Progress.',
        data: { complaint }
    });
});

exports.resolveComplaint=catchAsync(async(req,res,next)=>{
    const complaint = await Complaint.findById(req.params.id);
    if(!complaint){
        return next(new AppError('No complaint found with that ID.',404));
    }
    if(complaint.assignedWorker.toString()!==req.user._id.toString()){
        return next(new AppError('This complaint is not assigned to you.',403));
    }
    if (complaint.status !== 'In Progress') {
        return next(new AppError(`Cannot resolve. First mark it 'In Progress'. Current: '${complaint.status}'.`, 400));
    }
    if(!req.file){
        return next(new AppError('Please upload an after-image as proof of completion.',400));
    }
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    complaint.images.afterUrl = cloudinaryResult.url;
    complaint.images.afterPublicId = cloudinaryResult.publicId;
    complaint.status = 'Resolved';
    complaint.resolvedAt = new Date();
    complaint.workNotes = req.body.workNotes || '';
    await complaint.save();
    await AuditLog.create({
        complaintId: complaint._id,
        performedBy: req.user._id,
        action: 'STATUS_CHANGE',
        fromStatus: 'In Progress',
        toStatus: 'Resolved',
        comment: req.body.workNotes || `Complaint resolved by Worker ${req.user.name}.`
    });
    res.status(200).json({
        status: 'success',
        message: 'Complaint resolved successfully with after-image proof.',
        data: { complaint }
    });
})
