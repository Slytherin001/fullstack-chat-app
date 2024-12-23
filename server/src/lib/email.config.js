import nodemailer from "nodemailer"

const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    requireTLS:true,
    auth:{
        user:process.env.SMTP_EMAIL,
        pass:process.env.SMTP_PASSWORD,
    }
})

export const mailer=async(email,subject,content)=>{
    try {

        const mailOptions={
            from:process.env.SMTP_EMAIL,
            to:email,
            subject:subject,
            html:content
        }
        
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error)
            }

            console.log(info?.messageId)
            
        })

        
        
    } catch (error) {
        console.log(error) 
    }
}