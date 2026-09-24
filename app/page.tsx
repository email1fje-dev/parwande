"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const story="ساعت ۲۳:۴۰ بود. پلیس تماسی اضطراری از یک عمارت قدیمی دریافت کرد. وقتی مأموران رسیدند، پنج نفر داخل ساختمان بودند. برق ساختمان برای چند دقیقه قطع شده بود و در همین فاصله اتفاق مهمی افتاده بود. حالا پرونده در اختیار توست. با بررسی شواهد، پرسیدن سؤال‌های درست و پیدا کردن تناقض‌ها، حقیقت را پیدا کن.";

export default function Home(){
 const router=useRouter();
 const[i,setI]=useState(0),[done,setDone]=useState(false),[age,setAge]=useState("");
 useEffect(()=>{const saved=localStorage.getItem("parwande-age");if(saved)setAge(saved)},[]);
 useEffect(()=>{if(i<story.length){const t=setTimeout(()=>setI(i+1),28);return()=>clearTimeout(t)}setDone(true)},[i]);
 function start(){const n=Number(age);if(!Number.isInteger(n)||n<10||n>17)return;localStorage.setItem("parwande-age",String(n));router.push("/investigation")}
 return <main className="page"><section className="case">
  <div className="tag">CASE FILE · پرونده محرمانه</div>
  <h1 className="title">پرونده</h1>
  <div className="subtitle">یک حقیقت پنهان شده. پیدا کردنش با توست.</div>
  <div className="meta"><span className="pill">پرونده قابل‌حل</span><span className="pill">بازجویی با AI</span><span className="pill">سرنخ و خط زمانی</span></div>
  <div className="ageBox">
   <div><b>سن کارآگاه</b><span>برای ساختن پرونده‌ای مناسب با فضای سنی تو</span></div>
   <div className="ageChoices">{Array.from({length:8},(_,i)=>i+10).map(n=><button key={n} type="button" className={Number(age)===n?"ageChoice active": "ageChoice"} onClick={()=>setAge(String(n))}>{n}</button>)}</div>
  </div>
  <div className="story">{story.slice(0,i)}{!done&&<span className="cursor"> </span>}</div>
  <div className="actions">
   {!done&&<button className="btn secondary" onClick={()=>{setI(story.length);setDone(true)}}>رد کردن ⏭</button>}
   <button className="btn" disabled={!age} onClick={start}>{done?"شروع تحقیقات":"انتخاب سن و شروع"} <span>▶</span></button>
  </div>
 </section></main>
}