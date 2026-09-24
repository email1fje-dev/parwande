"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const story="ساعت ۲۳:۴۰ بود. پلیس تماسی اضطراری از یک عمارت قدیمی دریافت کرد. وقتی مأموران رسیدند، پنج نفر داخل ساختمان بودند. برق ساختمان برای چند دقیقه قطع شده بود و در همین فاصله اتفاق مهمی افتاده بود. حالا پرونده در اختیار توست. با بررسی شواهد، پرسیدن سؤال‌های درست و پیدا کردن تناقض‌ها، حقیقت را پیدا کن.";

export default function Home(){
 const router=useRouter();
 const[i,setI]=useState(0),[done,setDone]=useState(false),[age,setAge]=useState(13);
 useEffect(()=>{const saved=Number(localStorage.getItem("parwande-age"));if(saved>=10&&saved<=17)setAge(saved)},[]);
 useEffect(()=>{if(i<story.length){const t=setTimeout(()=>setI(i+1),28);return()=>clearTimeout(t)}setDone(true)},[i]);
 function start(){localStorage.setItem("parwande-age",String(age));localStorage.removeItem("parwande-case-id");router.push("/investigation")}
 function changeAge(delta:number){setAge(v=>Math.min(17,Math.max(10,v+delta)))}
 return <main className="page"><section className="case">
  <div className="tag">CASE FILE · پرونده محرمانه</div>
  <h1 className="title">پرونده</h1>
  <div className="subtitle">یک حقیقت پنهان شده. پیدا کردنش با توست.</div>
  <div className="meta"><span className="pill">پرونده قابل‌حل</span><span className="pill">بازجویی با AI</span><span className="pill">سرنخ و خط زمانی</span></div>

  <div className="agePicker">
   <div className="ageCopy"><span className="ageEyebrow">تنظیم پرونده</span><b>سن کارآگاه</b><span>سن را برای تنظیم فضای پرونده انتخاب کن.</span></div>
   <div className="ageControl">
    <button type="button" className="ageArrow" aria-label="یک سال کمتر" onClick={()=>changeAge(-1)} disabled={age<=10}>−</button>
    <div className="ageNumber"><strong>{age}</strong><span>سال</span></div>
    <button type="button" className="ageArrow" aria-label="یک سال بیشتر" onClick={()=>changeAge(1)} disabled={age>=17}>+</button>
   </div>
   <div className="ageScale">{Array.from({length:8},(_,i)=>i+10).map(n=><button type="button" key={n} className={age===n?"ageDot active":"ageDot"} onClick={()=>setAge(n)}>{n}</button>)}</div>
  </div>

  <div className="story">{story.slice(0,i)}{!done&&<span className="cursor"> </span>}</div>
  <div className="actions">
   {!done&&<button type="button" className="btn secondary" onClick={()=>{setI(story.length);setDone(true)}}>رد کردن ⏭</button>}
   <button type="button" className="btn" onClick={start}>{done?"شروع تحقیقات":"ادامه پرونده"} <span>▶</span></button>
  </div>
 </section></main>
}