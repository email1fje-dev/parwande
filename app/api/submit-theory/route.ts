import { NextRequest, NextResponse } from "next/server";

const U=process.env.SUPABASE_URL!;
const K=process.env.SUPABASE_PUBLISHABLE_KEY!;

export async function POST(req:NextRequest){
  const {theory}=await req.json();
  if(!theory?.trim()) return NextResponse.json({error:"نظریه خالی است."},{status:400});
  const h={apikey:K,Authorization:`Bearer ${K}`};
  const r=await fetch(`${U}/rest/v1/cases?code=eq.001&select=title,canonical_solution&limit=1`,{headers:h,cache:"no-store"});
  const c=(await r.json())[0];
  if(!c) return NextResponse.json({error:"پرونده پیدا نشد."},{status:404});
  const key=process.env.OPENROUTER_API_KEY;
  if(!key) return NextResponse.json({error:"AI grading unavailable"},{status:500});
  const x=await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method:"POST",
    headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json","HTTP-Referer":"https://parwande-production.up.railway.app","X-Title":"Parwande"},
    body:JSON.stringify({
      model:process.env.OPENROUTER_MODEL||"openai/gpt-4o-mini",
      temperature:0,max_tokens:350,
      messages:[
        {role:"system",content:"نظریه کارآگاه را فقط با حقیقت قطعی پرونده مقایسه کن. JSON معتبر با verdict, score, correct_points, missing_points, explanation بده. score عدد 0 تا 100 باشد و verdict یکی از correct, partial, incorrect باشد. اطلاعات جدید اختراع نکن."},
        {role:"user",content:`حقیقت قطعی: ${JSON.stringify(c.canonical_solution)}\nنظریه کارآگاه: ${theory}`}
      ]
    })
  });
  if(!x.ok) return NextResponse.json({error:"AI grading failed"},{status:502});
  const j=await x.json();
  let out=j.choices?.[0]?.message?.content||"{}";
  try{out=JSON.parse(out.replace(/```json|```/g,"").trim())}
  catch{out={verdict:"partial",score:0,correct_points:[],missing_points:["پاسخ داوری قابل پردازش نبود."],explanation:out}}
  return NextResponse.json(out);
}