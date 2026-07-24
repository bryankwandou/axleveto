import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { groundedInspectionDraft } from "@/lib/domain";

const input=z.object({vehicle_id:z.string().min(1),raw_notes:z.string().min(10)});
const section=(value:unknown)=>typeof value==="string"&&value.trim()?value.trim():"Not reported";

export async function POST(request:Request){
  const parsed=input.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"Vehicle and meaningful inspection notes are required."},{status:400});
  let draft=groundedInspectionDraft(parsed.data.raw_notes);
  let engine="deterministic-grounded";
  if(process.env.GROQ_API_KEY){
    try{
      const groq=new Groq({apiKey:process.env.GROQ_API_KEY});
      const completion=await groq.chat.completions.create({
        model:process.env.GROQ_MODEL||"llama-3.3-70b-versatile",
        temperature:0,
        response_format:{type:"json_object"},
        messages:[
          {role:"system",content:"Structure a fleet pre-trip inspection using only facts in the driver notes. Never infer that an unmentioned system passed. Return JSON keys tires, brakes, lights, fluids, body, safetyFlags, reviewRequired. Every absent section must be Not reported. safetyFlags must be an array of strings and reviewRequired must be true."},
          {role:"user",content:parsed.data.raw_notes},
        ],
      });
      const raw=JSON.parse(completion.choices[0]?.message?.content||"{}");
      draft={
        tires:section(raw.tires),
        brakes:section(raw.brakes),
        lights:section(raw.lights),
        fluids:section(raw.fluids),
        body:section(raw.body),
        safetyFlags:Array.isArray(raw.safetyFlags)?raw.safetyFlags.filter((item:unknown):item is string=>typeof item==="string"):[],
        reviewRequired:true,
      };
      engine="groq-grounded";
    }catch{
      engine="deterministic-grounded-fallback";
    }
  }
  return NextResponse.json({inspection_id:`INSP-${Date.now()}`,vehicle_id:parsed.data.vehicle_id,draft,engine,review_required:true});
}