import { Request, Response } from "express"

export interface CartItem {
    productId: string
    quantity: number
}

const getSessionCart = (req: Request): CartItem[] => {
    return req.session.cart || []
}

const setSessionCart = (req: Request, cart: CartItem[]) => {
    if (req.session) {
        req.session.cart = cart
    }
}

export const getCart = async (req: Request, res: Response) => {
    const cart = getSessionCart(req)
    res.json({ items: cart })
}

export const addCartItem = async (req: Request, res: Response) => {
    const { productId, quantity } = req.body

    if (!productId || !quantity) {
        res.status(400).json({ error: "productId et quantity sont requis" })
        return
    }

    const cart = getSessionCart(req)
    const existing = cart.find((item) => item.productId === productId)

    if (existing) {
        existing.quantity += quantity
    } else {
        cart.push({ productId, quantity })
    }

    setSessionCart(req, cart)
    res.json({ items: cart })
}

export const updateCartItem = async (req: Request, res: Response) => {
    const { productId } = req.params
    const { quantity } = req.body

    if (quantity === undefined) {
        res.status(400).json({ error: "quantity est requis" })
        return
    }

    let cart = getSessionCart(req)

    if (quantity <= 0) {
        cart = cart.filter((item) => item.productId !== productId)
    } else {
        const item = cart.find((item) => item.productId === productId)
        if (item) {
            item.quantity = quantity
        }
    }

    setSessionCart(req, cart)
    res.json({ items: cart })
}

export const removeCartItem = async (req: Request, res: Response) => {
    const { productId } = req.params
    const cart = getSessionCart(req).filter((item) => item.productId !== productId)

    setSessionCart(req, cart)
    res.json({ items: cart })
}

export const syncCart = async (req: Request, res: Response) => {
    const { items } = req.body

    if (!Array.isArray(items)) {
        res.status(400).json({ error: "items doit être un tableau" })
        return
    }

    const validItems = items.filter(
        (item) => item.productId && typeof item.quantity === "number" && item.quantity > 0
    )

    setSessionCart(req, validItems)
    res.json({ items: validItems })
}
