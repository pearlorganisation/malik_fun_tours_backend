import Contact from "../models/Contact.js";


export const createQuery = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const contact = await Contact.create({
            name,
            email,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Query created successfully",
            data: contact
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllQueries = async (req , res) => {
    try{
        const contacts = await Contact.find().sort({createdAt:-1});

        return res.status(200).json({
            success:true,
            message:"All queries fetched successfully",
            total:contacts.length,
            data:contacts
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


export const updateQueryStatus = async (req , res) => {
    try{
        const {id} = req.params;
        const {status} = req.body;

        const validStatuses = ['NEW','PENDING','RESOLVED'];

        if(!validStatuses.includes(status)){
            return res.status(400).json({
                success:false,
                message:"Invalid status value"
            })
        }

        const contact = await Contact.findById(id);

        if(!contact){
            return res.status(404).json({
                success:false,
                message:"Query not found"
            })
        }

        contact.status = status;
        await contact.save();

        return res.status(200).json({
            success:true,
            message:"Query status updated successfully",
            data:contact
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}