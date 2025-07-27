// const express = require("express");
// const router = express.Router();
// const FormConfiguration = require("../models/FormConfiguration");
// const { createFormSchema } = require("../validation/formValidation");

// const validateFormCreation = (req, res, next) => {
//     const { error, value } = createFormSchema.validate(req.body, { abortEarly: false });

//     if(error) {
//         const errors = error.details.map(detail => ({
//             field: detail.path.join('.'),
//             message: detail.message.replace(/"/g, '')
//         }))
//         return res.status(400).json({ msg: 'Validation Error', errors: errors });
//     }

//     req.validatedBody = value;
//     next();
// };

// // @route POST /api/forms
// // @route create a new form configuration
// // @access Public (for now)

// router.post("/", validateFormCreation, async (req, res) => {
//     try {
//         const { name, description, questions } = req.validatedBody;
//         const newForm = new FormConfiguration({
//             name,
//             description,
//             questions
//         });
//         const form = await newForm.save();
//         res.status(201).json(form);
//     } catch(err) {
//         console.error(err.message);
//         if(err.code === 11000) {
//             return res.status(409).json({ msg: "form alreadt exists. Please choose a different name."});
//         }
//         res.status(500).send("Server Error");
//     }
// });

// // @route GET /api/forms/:id
// // @desc Get a single form configuration by ID
// // @access Public
// router.get("/:id", async (req, res) => {
//     try {
//         const form = await FormConfiguration.findById(req.params.id);
//         if(!form) {
//             return res.status(404).json({ msg: "form not found"});
//         }
//         res.json(form);
//     } catch(err) {
//         console.error(err.message);
//         if(err.kind === 'ObjectId') {
//             return res.status(400).json({ msg: 'Invalid form ID format'});
//         }
//         res.status(500).send("Server Error");
//     }
// });

// module.exports = router;
