import React, { useState } from "react";
import axios from "axios";

import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { updateThisResume } from "@/Services/resumeAPI";


const promptTemplate =
  "Job Title: {jobTitle}, Based on the job title, provide a list of summary descriptions for three experience levels: Mid-Level and Fresher level. Each summary should be 3-4 lines long, formatted in an array with 'summary' and 'experience_level' fields in JSON format.";

function Summary({ resumeInfo, enanbledNext, enanbledPrev }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(resumeInfo?.summary || "");
  const [aiGeneratedSummaryList, setAiGenerateSummaryList] = useState(null);
  const { resume_id } = useParams();

  const handleInputChange = (e) => {
    enanbledNext(false);
    enanbledPrev(false);
    dispatch(
      addResumeData({
        ...resumeInfo,
        [e.target.name]: e.target.value,
      })
    );
    setSummary(e.target.value);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Saving Summary...");

    const data = {
      data: { summary },
    };

    if (resume_id) {
      try {
        await updateThisResume(resume_id, data);
        toast("Resume Updated", "success");
      } catch (error) {
        toast("Error updating resume", error.message);
      } finally {
        enanbledNext(true);
        enanbledPrev(true);
        setLoading(false);
      }
    }
  };

  const setSummery = (summary) => {
    dispatch(
      addResumeData({
        ...resumeInfo,
        summary: summary,
      })
    );
    setSummary(summary);
  };

  const GenerateSummeryFromAI = async () => {
    setLoading(true);
    console.log("Generate Summary From AI for", resumeInfo?.jobTitle);
  
    if (!resumeInfo?.jobTitle) {
      toast("Please Add Job Title");
      setLoading(false);
      return;
    }
  
    const PROMPT = promptTemplate.replace("{jobTitle}", resumeInfo?.jobTitle);
  
    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAIeShHBvjkRYmj01PbthUBX-JiBYDFUXU",
        method: "post",
        data: { contents: [{ parts: [{ text: PROMPT }] }] },
      });
  
      const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("AI Response:", result);
  
      if (result) {
        const cleanedResult = result.replace(/```json|```/g, '').trim();
  
        try {
          const parsedResult = JSON.parse(cleanedResult);
          setAiGenerateSummaryList(parsedResult);
          toast("Summary Generated", "success");
        } catch (parseError) {
          toast("Error: Invalid JSON response", "error");
          console.error("Error parsing JSON:", parseError);
        }
      } else {
        toast("Failed to generate summary", "error");
      }
    } catch (error) {
      console.error(error);
      toast("Error generating summary", `${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Summary</h2>
        <p>Add a summary for your job title</p>

        <form className="mt-7" onSubmit={onSave}>
          <div className="flex justify-between items-end">
            <label>Add Summary</label>
            <Button
              variant="outline"
              onClick={GenerateSummeryFromAI}
              type="button"
              size="sm"
              className="border-primary text-primary flex gap-2"
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate from AI
                </>
              )}
            </Button>
          </div>
          <Textarea
            name="summary"
            className="mt-5"
            required
            value={summary}
            onChange={handleInputChange}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>

      {aiGeneratedSummaryList && (
        <div className="my-5">
          <h2 className="font-bold text-lg">Suggestions</h2>
          {aiGeneratedSummaryList.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                enanbledNext(false);
                enanbledPrev(false);
                setSummery(item.summary);
              }}
              className="p-5 shadow-lg my-4 rounded-lg cursor-pointer"
            >
              <h2 className="font-bold my-1 text-primary">
                Level: {item.experience_level}
              </h2>
              <p>{item.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Summary;
