import { NextResponse,NextRequest } from "next/server"

export const requestID = (req:NextRequest)=>{
    const existingId = req.headers.get("x-request-id")?.trim()
    return existingId || crypto.randomUUID()
}

export const applyRequestID  = (req:NextRequest,res:NextResponse)=>{
    const requestid = requestID(req)
    res.headers.set("x-request-id",requestid)
    return res
}