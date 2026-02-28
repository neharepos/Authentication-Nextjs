import {connect} from "@/app/dbConfig/dbConfig";
import User from "@/src/models/userModel"
import { NextResponse, NextRequest} from "next/server";
import bcrypt from "bcryptjs";


connect();


export async function POST(request:NextRequest){
    try {
        const reqBody = await request.json();
        const {username, email, password} = reqBody;

        console.log(reqBody);

        //check if useralready exists

        const user = await User.findOne({email});

        if(user){
            return NextResponse.json({error: "USer already exists"}, {status: 404})
        }

        //hash password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);      

        const newUser = new User({
            username,
            email,
            password: hashedPassword
         })

         const savedUser = await newUser.save();
         console.log(savedUser);

         return NextResponse.json({
            message: "User created successfully",
            success: true,
            savedUser
         })

         
    } catch (error) {
        return NextResponse.json({error: error.message},
            {status: 500})
    }
}
