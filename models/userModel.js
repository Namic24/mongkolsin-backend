import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },  // ชื่อ
    lastName: { type: String, required: true },   // นามสกุล
    email : { type: String, required: true },      // อีเมล
    street: { type: String, required: true },     // ที่อยู่ (ถนน)
    city: { type: String, required: true },       // เมือง
    state: { type: String, required: true }, // เลขไปรษณีย์
    country: { type: String, required: true },
    zipcode: { type: String, required: true },
    phone: { type: String, required: true },      // เบอร์โทรศัพท์
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    addresses: { type: [addressSchema], default: [] }
    
})


const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel