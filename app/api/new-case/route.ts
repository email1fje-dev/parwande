import{NextRequest,NextResponse}from"next/server";
const U=process.env.SUPABASE_URL!,K=process.env.SUPABASE_SERVICE_ROLE_KEY!,AI=process.env.OPENROUTER_API_KEY!;
const fail=(m:string,s=500)=>NextResponse.json({error:m},{status:s});
const str=(x:any)=>typeof x==="string"?x.trim():"";
export async function POST(req:NextRequest){
 if(!U||!K||!AI)return fail("تنظیمات سرور کامل نیست.");
 const {age=13,difficulty="کارآگاه"}=await req.json();const targetAge=Math.max(10,Math.min(17,Number(age)||13));
 const prompt=`یک پرونده کارآگاهی کاملاً خیالی و قابل‌حل به زبان فارسی برای کاربر ${targetAge} ساله بساز. فضای داستان مناسب این سن باشد و بدون محتوای جنسی صریح، مصرف مواد یا جزئیات گرافیکی خشونت باشد. حقیقت از ابتدا ثابت باشد؛ دقیقاً یک مقصر داشته باشد؛ حداقل 3 مدرک مستقل و یک تناقض زمانی/روایی داشته باشد. فقط JSON بده: {"title":"","difficulty":"${difficulty}","opening_story":"","canonical_solution":{"culprit":"","event":"","proof_evidence_titles":[],"key_timeline_facts":[],"age_min":${targetAge},"age_max":${targetAge}},"suspects":[{"name":"","role":"","personality":"","alibi":"","secrets":[],"knowledge":[]}],"evidence":[{"title":"","description":"","importance":"critical|high|normal"}],"timeline":[{"event_time":"","title":"","description":""}]} 4 تا 6 مظنون، 4 تا 7 مدرک و 4 تا 7 رویداد زمانی.`;
 const x=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${AI}`,"Content-Type":"application/json","HTTP-Referer":"https://parwande-production.up.railway.app","X-Title":"Parwande"},body:JSON.stringify({model:"openrouter/free",temperature:.55,max_tokens:5000,messages:[{role:"system",content:prompt},{role:"user",content:"یک پرونده تازه و متفاوت بساز."}]})});
 if(!x.ok)return fail("ساخت پرونده با AI ناموفق بود.",502);const j=await x.json();let raw=j.choices?.[0]?.message?.content||"{}";let c:any;try{c=JSON.parse(raw.replace(/^```json|^```|```$/g,"").trim())}catch{return fail("AI یک پرونده معتبر برنگرداند.",502)}
 if(!str(c.title)||!str(c.opening_story)||!c.canonical_solution||!str(c.canonical_solution.culprit)||!Array.isArray(c.suspects)||c.suspects.length<4||!Array.isArray(c.evidence)||c.evidence.length<4||!Array.isArray(c.timeline)||c.timeline.length<4)return fail("Validator: ساختار پرونده قابل‌حل نیست.",422);
 if(!c.suspects.map((s:any)=>str(s.name)).includes(str(c.canonical_solution.culprit)))return fail("Validator: مقصر بین مظنون‌ها نیست.",422);
 if(!Array.isArray(c.canonical_solution.proof_evidence_titles)||c.canonical_solution.proof_evidence_titles.length<2)return fail("Validator: مدارک اثباتی کافی نیست.",422);
 c.canonical_solution.age_min=targetAge;c.canonical_solution.age_max=targetAge;
 const code=String(Date.now()).slice(-6),base={apikey:K,Authorization:`Bearer ${K}`,"Content-Type":"application/json"};
 const cr=await fetch(`${U}/rest/v1/cases`,{method:"POST",headers:{...base,Prefer:"return=representation"},body:JSON.stringify({code,title:str(c.title),difficulty:str(c.difficulty)||difficulty,opening_story:str(c.opening_story),canonical_solution:c.canonical_solution})});
 if(!cr.ok)return fail("ذخیره پرونده شکست خورد.",500);const saved=(await cr.json())[0];
 for(let i=0;i<c.suspects.length;i++){const s=c.suspects[i];await fetch(`${U}/rest/v1/suspects`,{method:"POST",headers:base,body:JSON.stringify({case_id:saved.id,name:str(s.name),role:str(s.role),personality:str(s.personality),alibi:str(s.alibi),secrets:Array.isArray(s.secrets)?s.secrets:[],knowledge:Array.isArray(s.knowledge)?s.knowledge:[],sort_order:i})})}
 for(let i=0;i<c.evidence.length;i++){const e=c.evidence[i];await fetch(`${U}/rest/v1/evidence`,{method:"POST",headers:base,body:JSON.stringify({case_id:saved.id,title:str(e.title),description:str(e.description),importance:str(e.importance)||"normal",sort_order:i})})}
 for(let i=0;i<c.timeline.length;i++){const t=c.timeline[i];await fetch(`${U}/rest/v1/timeline_events`,{method:"POST",headers:base,body:JSON.stringify({case_id:saved.id,event_time:str(t.event_time),title:str(t.title),description:str(t.description),sort_order:i})})}
 return NextResponse.json({ok:true,case:{id:saved.id,code,title:str(c.title)},message:"پرونده جدید آماده است."});
}