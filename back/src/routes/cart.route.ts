import { Router } from "express"
import { asyncHandler } from "@/middleware/error.js"
import {
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    syncCart,
} from "@/controllers/cart.controller.js"

const cartRouter = Router()

cartRouter.get("/", asyncHandler(getCart))
cartRouter.post("/items", asyncHandler(addCartItem))
cartRouter.put("/items/:productId", asyncHandler(updateCartItem))
cartRouter.delete("/items/:productId", asyncHandler(removeCartItem))
cartRouter.post("/sync", asyncHandler(syncCart))

export { cartRouter }
