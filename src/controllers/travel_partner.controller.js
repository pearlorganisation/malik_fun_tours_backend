import { uploadFileToCloudinary } from "../configs/cloudinary.js";
import Travel_Partner from "../models/TravelPartners.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";


//create a new partner
export const create_partner = asyncHandler(async(req, res , next)=>{
   try{
        const {name ,  description}  = req.body;
    let logo = null;
    if (req.file || req.files) {
    const fileToUpload = req.file || req.files.logo || req.files[0];
      const uploadResult = await uploadFileToCloudinary(fileToUpload, "travel_partners");

      // uploadFileToCloudinary returns an array → take first element
      logo = uploadResult[0];
  }
        if(!name){
            return res.status(400).json({message:"name is required"});
        }

        const newPartner = await Travel_Partner.create( {
                name,description,logo
        })

        res.status(201).json(
            {
                message:"Partner created successfully.",
                data:newPartner
            }
        )
    }catch(error){
        res.status(500).json({message:error.message})
    }

})


//get all partners
export const getAllPartners = asyncHandler(async (req, res) => {
   try{
      const partners= await Travel_Partner.find().sort(({created:-1}))
      res.status(200).json({message:"Data fetch succesfully",
        data:partners
      });
   }catch(error){
     res.status(500).json({message:error.message});
   } 
})


//get partner by id 
export const getPartnerById = asyncHandler(async (req,res)=>{

 try{
    const { id } =req.params;

    const Partner=await Travel_Partner.findById(id);

    if(!Partner){
        res.status(404).json({message:'Partner not found'})
    }

    res.status(200).json({message:'Partner found successfully',
        data:Partner
    })
 }catch(error){
    res.status(500).json({message:error.message})
 }
})


//update the partner
export const updatePartner = asyncHandler(async (req,res)=>{

    try{
        const { id } = req.params;

        const updatedPartner = await Travel_Partner.findByIdAndUpdate(
            id,
            req.body,
            { new: true , runValidators:true }
        )

        if(!updatePartner){
           return  res.status(404).json({message:"Partner not found"})
        }

        res.status(200).json({
            message:"Partner updated successfully",
            data:updatePartner
        });
    }catch(error){
        res.status(500).json({message:error.message})
    }

})


//delete the partner
export const deletePartner =asyncHandler(async(req,res)=>{
    try{
        const {id} = req.body;

        const deletedPartner = await Travel_Partner.findByIdAndDelete(id);

        if(!deletePartner){
            res.status(404).json({message:"Partner not found"})
        }

        res.status(200).json({message:"Partner deleted successfully",
            data:deletePartner
        })
    }catch(error){
        res.status(500).json({message:error.message})
    }
})