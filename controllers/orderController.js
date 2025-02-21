import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js";
import Stripe from "stripe";

//global variables
const currency = 'thb'
const deliveryCharge = 10

//gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Placing  orders using COD Method
const placeOrder = async (req,res) => {

    try {
        
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success: true ,message:"Order Placed"})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
    }

}

// Placing  orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;
        if (!origin) {
            return res.json({ success: false, message: 'Origin is missing from the request headers.' });
        }
        // เตรียมข้อมูลสำหรับการสั่งซื้อ
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        // บันทึกคำสั่งซื้อใหม่ในฐานข้อมูล
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // เตรียมข้อมูล line_items สำหรับ Stripe session
        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name // เข้าถึงชื่อสินค้าจาก `item.name`
                },
                unit_amount: item.price *  // Stripe ใช้หน่วยที่เล็กที่สุด (เช่น เซ็นต์)
            },
            quantity: item.quantity
        }));

        // เพิ่มค่าจัดส่งใน line_items
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges' // ค่าจัดส่ง
                },
                unit_amount: deliveryCharge * 10 // แปลงเป็นหน่วยที่เล็กที่สุด (เช่น เซ็นต์)
            },
            quantity: 1 // มีค่าจัดส่ง 1 รายการต่อการสั่งซื้อ
        });

        // สร้าง session ของ Stripe สำหรับการชำระเงิน
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        // ส่ง URL ของ session กลับไปยัง frontend
        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//Vertify stripe
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId, {cartData:{}})
            res.json({success: true});
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing  orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    
}

// All Orders data for Admin Panel
const allOrders = async (req,res) => {
    
    try {
        
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }

}

// All Orders data for Forntend
const userOrders = async (req,res) => {
    try {

        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

export {verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus}