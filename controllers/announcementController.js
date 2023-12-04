const Announcement = require('../models/announcementModel')
const User = require('../models/usersModel')
const asyncHandler = require('express-async-handler')
const cloudinary = require('cloudinary').v2;
const fs = require('fs')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

// to get all announcements
const getAllAnnouncements = async(req, res) => {
    const announcements = await Announcement.find().sort({createdAt: -1})

    res.status(StatusCodes.OK).json({announcements})
}

// to create a new announcement
const addAnnouncement = async(req, res) => {
    const {anncmnt_title, anncmnt_description, image, anncmnt_date} = req.body;

    if(!anncmnt_title || !anncmnt_description){
        throw new CustomError.BadRequestError('title and description are required')
    };


    const admin = await User.findById(req.user.userId);

    if (!admin) {
        throw new CustomError.NotFoundError('Admin not found')
    }
 

    const announcement = await Announcement.create({
        anncmnt_title, 
        anncmnt_description, 
        image, 
        anncmnt_date, 
        anncmnt_publisher: admin.full_name,
        user:req.user.userId
    });
    
  
    res.status(StatusCodes.CREATED).json({announcement});
}

// to update announcement
const updateAnnouncement = async(req, res) => {
   
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        // res.status(404)
        // throw new Error("No announcement found");
        throw new CustomError.NotFoundError('No announcement found')
    }

    const updateAnnouncement = await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true}
    )

    res.status(StatusCodes.OK).json(updateAnnouncement)
}


// to delete announcement
const deleteAnnouncement = async (req, res) => {

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        throw new CustomError.NotFoundError('No announcement found')
    }

   
    try {
        if (announcement.image) {
            const publicId = announcement.image.match(/\/v\d+\/(.+?)\./)[1];
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
    }

    await Announcement.deleteOne({ _id:announcement});

    res.status(200).json({ message: "Announcement deleted", announcement });
};


// to upload image in cloudinary
const uploadAnnImage = async(req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(200).json({ message: 'announcement without image' });
    }

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename:true,
        folder:'announcement-folder'
    })

    fs.unlinkSync(req.files.image.tempFilePath)

    return res.status(200).json({image:{src:result.secure_url}})
}

// to udpate image in cloudinary
const uploadUpdateAnnImage = async (req, res) => {
  
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        return res.status(404).json({ error: "No announcement found" });
    }

    try {
        if (announcement.image) {
            const publicId = announcement.image.match(/\/v\d+\/(.+?)\./)[1];
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error("Error deleting existing image from Cloudinary:", error);
    }

    if (!req.files || !req.files.image) {
        return res.status(200).json({ message: 'announcement without image' });
    }

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: true,
        folder: 'announcement-folder'
    });


    fs.unlinkSync(req.files.image.tempFilePath);

    return res.status(200).json({ image: { src: result.secure_url } });
}



module.exports = {
    getAllAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    uploadAnnImage,
    uploadUpdateAnnImage
}