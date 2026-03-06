import { connect } from "@/app/dbConfig/dbConfig";
import User from "@/src/models/userModel"
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/src/helpers/mailer"; // You'll need a mailer helper

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email } = reqBody;

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        // 2. Create a temporary token using Node's crypto library
        const hashedToken = crypto.randomBytes(32).toString("hex");

        // 3. Save token to DB with an expiry (e.g., 1 hour from now)
        user.forgotPasswordToken = hashedToken;
        user.forgotPasswordTokenExpiry = Date.now() + 3600000; 
        await user.save();

        // 4. Send the email (Pass the token to your mailer function)
        await sendEmail({ email, emailType: "RESET", userId: user._id, token: hashedToken });

        return NextResponse.json({ message: "Reset email sent successfully", success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}