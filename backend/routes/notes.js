const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var fetchuser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');


//Get All the Notes using: GET "/api/notes/fetchallnotes . Login req"

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({user: req.user.id})
        res.json(notes)
    } catch (error) {
      console.log(error)  
      res.status(500).send("Internal Server Error");
    }  
})

//Add the Notes using: Post "/api/notes/addnote . Login req"
router.post('/addnote',fetchuser, [
    body('title', 'Enter a valid title').isLength({min : 3}),
    body('description', 'Description must be atleast 5 char').isLength({min : 5}),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //if there are err return bad req and errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user:req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occurred") 
    }
})

//Add the Notes using: Post "/api/notes/updatenote . Login req"
router.put('/updatenote/:id',fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // Create a newNote obj
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};

        //Fined the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).send("Not Found");
        }
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json(note)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occurred") 
    }
})

//Add the Notes using: Post "/api/notes/deletenote . Login req"
router.delete('/deletenote/:id',fetchuser, async (req, res) => {
    try {
        //Fined the note to be delete and delete it
        let note = await Notes.findById(req.params.id);
        if(!note){
            return res.status(404).send("Not Found");
        }
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({"Success": "Note has been deteted", note: note})
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error") 
    }
})

module.exports = router