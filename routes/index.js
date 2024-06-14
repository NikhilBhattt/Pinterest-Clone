var express = require('express');
var router = express.Router();
var userModel = require('./users')
var postModel = require('./posts')
var passport = require('passport')
var localStrategy = require('passport-local')

passport.use(new localStrategy(userModel.authenticate()))
var upload = require('./multer')

// GET home page. 
router.get('/', function(req, res) {
  res.render('index', { error : req.flash('error') })
})

router.post('/login', passport.authenticate('local', {
  successRedirect : '/feed',
  failureRedirect : '/',
  failureFlash: true
}), function(req, res) {} )

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', function(req, res){
  const { username , fullname, email } = req.body
  const userData = new userModel({ username, fullname, email })

  userModel.register(userData, req.body.password).then(function() {
      passport.authenticate('local')(req, res, function(){
        res.redirect('/profile')
      })
    })
})

router.get('/profile', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({
    username : req.session.passport.user
  }).populate(['posts', 'boards', 'likes'])

  res.render('profile', { user })
}) 

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) return next(err)
    res.redirect('/')
  })
})

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) return next()
  res.redirect('/')
}

router.post('/profile-upload',isLoggedIn, upload.single('profileImg'), async function(req, res) {
  const user = await userModel.findOne({username : req.session.passport.user})
  user.profileImg = req.file.filename
  await user.save() 
  res.redirect('/profile')
})

router.get('/create-post', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({
    username : req.session.passport.user
  })
  res.render('post', { user })
})

router.post('/create-post', isLoggedIn, upload.single('postImage'), async function(req, res) {
  const user = await userModel.findOne({
    username : req.session.passport.user
  })
  const { title, description } = req.body
  const post = await postModel.create({
    user : user._id,
    img : req.file.filename,
    title : title,
    description : description
  })

  user.posts.push(post._id)
  await user.save()

  res.redirect('/profile')
})

router.get('/show/:content', isLoggedIn, async function(req, res) {
  const content = req.params.content
  if (!['boards', 'posts', 'likes'].includes(content)) {
    return res.status(404).send('No Such Path/Route!')
  }

  const user = await userModel.findOne({
    username : req.session.passport.user
  }).populate(['posts', 'boards', 'likes'])

  res.render('show', { user, content })
})

router.get('/feed', isLoggedIn, async function(req, res) {
  const allPosts = await postModel.find().populate('user')
  const msg = req.flash('msg')
  const msgType = req.flash('msgType')

  res.render('feed', { allPosts, msg, msgType })
})

router.get('/show/post/:id', isLoggedIn, async function(req, res) {
  const post = await postModel.findOne({ _id : req.params.id})
  res.redirect(`/images/uploads/${post.img}`)
})

router.get('/like/:post_id', isLoggedIn, async function(req, res) {

  const post_id = req.params.post_id
  const user = await userModel.findOne({ username : req.session.passport.user })

  if (user.likes.includes(post_id)) {
    req.flash('msg', 'Post Already Liked!')
    req.flash('msgType', 'warning')
  }
  else {
    user.likes.push(post_id)
    await user.save()
    req.flash('msg', 'Post Liked!')
    req.flash('msgType', 'success')
  } 
  res.redirect('/feed')
})

router.get('/board/:post_id', isLoggedIn, async function(req, res) {
  const post_id = req.params.post_id
  const user = await userModel.findOne({ username : req.session.passport.user })

  if (user.boards.includes(post_id)) {
    req.flash('msg', 'Post Already Pinned!')
    req.flash('msgType', 'warning')
  }
  else{
    user.boards.push(post_id)
    await user.save()
    req.flash('msg', 'Post Pinned!')
    req.flash('msgType', 'success')
  }
  res.redirect('/feed')
})

module.exports = router;
