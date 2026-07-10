const Complaint = require('../models/Complaint');
const catchAsync= require('../utils/catchAsync');
exports.getCategoryStats=catchAsync(async(req,res,next)=>{
    const stats=await Complaint.aggregate([
        {
            $group:{
                _id:'$category',
                total:{$sum:1},
                resolved:{
                    $sum:{
                        $cond:[{$eq:['$status','Resolved']},1,0]
                    }
                },
                pending:{
                    $sum:{
                        $cond:[{$ne:['$status','Resolved']},1,0]
                    }
                }
            }
        },
        {
            $sort:{total:-1}
        },
        {
            $project:{
                _id:0,
                category:'$_id',
                total:1,
                resolved:1,
                pending:1
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        results: stats.length,
        data: { stats }
    });
});
exports.getMonthlyVelocity= catchAsync(async(req,res,next)=>{
    const velocity=await Complaint.aggregate([
        {
            $group:{
                _id:{
                    month:{$dateToString:{format:'%Y-%m',
                        date:'$createdAt'
                    }}
                },
                created:{$sum:1},
                resolved:{
                    $sum:{
                        $cond:[{$eq:['$status','Resolved']},1,0]
                    }
                }
            }
        },
        {
            $sort:{'_id.month':1}
        },
        {
            $project:{
                _id:0,
                month:'$_id.month',
                created:1,
                resolved:1
            }
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'success',
        results: velocity.length,
        data: { velocity }
    });
});
exports.getAreaTrends = catchAsync(async (req, res, next) => {
    const trends = await Complaint.aggregate([
        {
            $match: {
                'location.address': { $exists: true, $ne: null, $ne: '' }
            }
        },
        {
            $group: {
                _id: '$location.address',
                total: { $sum: 1 },
                critical: {
                    $sum: {
                        $cond: [{ $eq: ['$priority', 'Urgent'] }, 1, 0]
                    }
                }
            }
        },
        {
            $sort: { total: -1 }
        },
        {
            $limit: 10
        },
        {
            $project: {
                _id: 0,
                area: '$_id',
                total: 1,
                critical: 1
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        results: trends.length,
        data: { trends }
    });
});