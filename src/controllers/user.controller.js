import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // *step 1.: get user details from frontend.  ✅
    // **Validation of Info given by User and NOT EMPTY. ✅
    // ***check if user already Exists using username and email. ✅
    // ****check for images, check for avatar. ✅
    // *****upload them to cloudinary, avatar  ✅
    // ******Create User Object - create entry in db  ✅
    // *******remove password and refresh token field from response  ✅
    // check for user creation ✅
    // return response 


    const { fullName, email, username, password } = req.body
    console.log("email ", email);

    // if(fullName === ""){
    //     throw new ApiError(400,"Full Name is Required...")
    // }        it is valid but we use advance concept
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required...")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists...")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImgLocalPathh = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is Required...")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImgLocalPathh)

    if (!avatar) {
        throw new ApiError(400, "Avatar is Required...")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowercase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User register Successfully")
    )

})


export { registerUser }