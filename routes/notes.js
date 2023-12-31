const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Note = require('../models/Note')

// @desc    Show add page
// @route   GET /notes/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('notes/add')
})

// @desc    Process add form
// @route   POST /notes
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Note.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all notes
// @route   GET /notes
router.get('/', ensureAuth, async (req, res) => {
  try {
    const notes = await Note.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('notes/index', {
      notes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single note
// @route   GET /notes/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id).populate('user').lean()

    if (!note) {
      return res.render('error/404')
    }

    if (note.user._id != req.user.id && note.status == 'private') {
      res.render('error/404')
    } else {
      res.render('notes/show', {
        note,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /notes/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
    }).lean()

    if (!note) {
      return res.render('error/404')
    }

    if (note.user != req.user.id) {
      res.redirect('/notes')
    } else {
      res.render('notes/edit', {
        note,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update note
// @route   PUT /notes/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id).lean()

    if (!note) {
      return res.render('error/404')
    }

    if (note.user != req.user.id) {
      res.redirect('/notes')
    } else {
      note = await Note.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete note
// @route   DELETE /notes/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id).lean()

    if (!note) {
      return res.render('error/404')
    }

    if (note.user != req.user.id) {
      res.redirect('/notes')
    } else {
      await Note.deleteOne({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User notes
// @route   GET /notes/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('stories/index', {
      notes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

//@desc Search notes by title
//@route GET /notes/search/:query
router.get('/search/:query', ensureAuth, async (req, res) => {
  try{
      const notes = await Note.find({title: new RegExp(req.query.query,'i'), status: 'public'})
      .populate('user')
      .sort({ createdAt: 'desc'})
      .lean()
     res.render('notes/index', { notes })
  } catch(err){
      console.log(err)
      res.render('error/404')
  }
})


module.exports = router