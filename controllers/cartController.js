import userModel from "../models/userModel.js"


// add product to user cart
const addTocart = async (req,res) => {
    try {
        
        const { userId, itemId, size } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            }
            else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {cartData})

        res.json({ success: true, message: "Add To Cart" })

    } catch (error) {
        console.log();
        res.json({ success: false, message:error.message })   
    }
}

// update user cart
const updateCart = async (req,res) => {
    try {
        
        const { userId, itemId, size, quantily } = req.body
        
        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantily

        await userModel.findByIdAndDelete(userId, {cartData})
        res.json({ success: true, message: "Cart Updated" })


    } catch (error) {
        console.log();
        res.json({ success: false, message:error.message })  
    }
}

// get user cart data
const getUserCart = async (req,res) => {
    try {
            
        const { userId } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData})

    } catch (error) {
        console.log();
        res.json({ success: false, message:error.message })
        
    }
    
}

// get address customers   เพิ่มตรงนี้มาที่เดียว
const getadderss = async (req,res) => {
    try {
            
        const { userId } = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({ success: true, cartData})

    } catch (error) {
        console.log();
        res.json({ success: false, message:error.message })
        
    }
    
}

export { addTocart, updateCart, getUserCart }