 const isAuthorized = (...roles) => {
return (req,res,next)=>{
    try {
   
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "user is not eligible for the operation",
      });
    }

    return next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: " unauthorized request",
    });
  }
}
}; export default isAuthorized