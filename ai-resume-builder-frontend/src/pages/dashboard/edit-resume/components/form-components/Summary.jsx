import React, { useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { updateThisResume } from "@/Services/resumeAPI";
import axios from "axios";

const prompt =
  "Job Title: {jobTitle}, Depends on job title give me list of summaries for 3 experience levels: Mid Level, Freshers, and 3-4 lines in array format, with summary and experience_level fields in JSON format";

function Summary({ resumeInfo, enanbledNext, enanbledPrev }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(() => {
    return localStorage.getItem("resumeSummary") || resumeInfo?.summary || "";
  });
  
  const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState(null);
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
  
    const data = { summary };
  
    if (resume_id) {
      try {
        const response = await updateThisResume(resume_id, data);
  
        // Update Redux state
        dispatch(addResumeData({ ...resumeInfo, summary }));
  
        // Store summary in localStorage for persistence
        localStorage.setItem("resumeSummary", summary);
  
        toast("Resume Updated", "success");
      } catch (error) {
        toast("Error updating resume", `${error.message}`);
      } finally {
        enanbledNext(true);
        enanbledPrev(true);
        setLoading(false);
      }
    }
  };
  
  

  const setSummery = (summary) => {
    dispatch(addResumeData({ ...resumeInfo, summary }));
    setSummary(summary);
  
    // Persist summary in localStorage
    localStorage.setItem("resumeSummary", summary);
  };
  

  const GenerateSummeryFromAI = async () => {
    setLoading(true);
    console.log("Generate Summary From AI for", resumeInfo?.jobTitle);
  
    if (!resumeInfo?.jobTitle) {
      toast("Please Add Job Title");
      setLoading(false);
      return;
    }
  
    const PROMPT = prompt.replace("{jobTitle}", resumeInfo?.jobTitle);
  
    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAIeShHBvjkRYmj01PbthUBX-JiBYDFUXU",
        method: "post",
        data: { contents: [{ parts: [{ text: PROMPT }] }] },
      });
  
      const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("AI Response:", result);
  
      if (result) {
        // Clean the response to remove any markdown or unwanted characters like backticks
        const cleanedResult = result.replace(/```json|```/g, '').trim();
  
        try {
          // Attempt to parse the cleaned result as JSON
          const parsedResult = JSON.parse(cleanedResult);
          setAiGenerateSummeryList(parsedResult);
          toast("Summary Generated", "success");
        } catch (parseError) {
          // Handle the case where the response is still not valid JSON
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
        <p>Add Summary for your job title</p>

        <form className="mt-7" onSubmit={onSave}>
          <div className="flex justify-between items-end">
            <label>Add Summary</label>
            <Button
              variant="outline"
              onClick={() => GenerateSummeryFromAI()}
              type="button"
              size="sm"
              className="border-primary text-primary flex gap-2"
            >
              <Sparkles className="h-4 w-4" /> Generate from AI
            </Button>
          </div>
          <Textarea
            name="summary"
            className="mt-5"
            required
            value={summary ? summary : resumeInfo?.summary}
            onChange={handleInputChange}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>

      {aiGeneratedSummeryList && (
        <div className="my-5">
          <h2 className="font-bold text-lg">Suggestions</h2>
          {aiGeneratedSummeryList?.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                enanbledNext(false);
                enanbledPrev(false);
                setSummery(item?.summary);
              }}
              className="p-5 shadow-lg my-4 rounded-lg cursor-pointer"
            >
              <h2 className="font-bold my-1 text-primary">
                Level: {item?.experience_level}
              </h2>
              <p>{item?.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Summary;
