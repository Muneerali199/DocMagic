import { NextResponse,NextRequest } from "next/server"

export const requestID = (req:NextRequest)=>{
    return req.headers.get("x-request-id") ?? crypto.randomUUID()
}

export const applyRequestID  = (req:NextRequest,res:NextResponse)=>{
    const requestid = requestID(req)
    res.headers.set("x-request-id",requestid)
    return res
}