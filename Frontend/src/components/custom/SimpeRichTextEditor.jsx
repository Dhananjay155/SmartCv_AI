import React, { useEffect, useState } from "react";
import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnUnderline,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Sparkles, LoaderCircle } from "lucide-react";
import axios from "axios";

const PROMPT = `Create a JSON object with the following fields:
"projectName": A string representing the project
"techStack": A string representing the project tech stack
"projectSummary": An array of strings, each representing a bullet point in HTML format describing relevant experience for the given project title and tech stack.
projectName-"{projectName}"
techStack-"{techStack}"`;

const geminiAPI = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  headers: {
    'Content-Type': 'application/json',
  }
});

function SimpleRichTextEditor({ index, onRichTextEditorChange, resumeInfo }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  
  const API_KEY = "AIzaSyAIeShHBvjkRYmj01PbthUBX-JiBYDFUXU";

  useEffect(() => {
    if (resumeInfo?.projects?.[index]?.projectSummary) {
      setValue(resumeInfo.projects[index].projectSummary);
    }
  }, [resumeInfo, index]);

  useEffect(() => {
    if (value) {
      onRichTextEditorChange(value);
    }
  }, [value, onRichTextEditorChange]);

  const validateProjectData = () => {
    if (!resumeInfo?.projects?.[index]) {
      toast("Project data not found");
      return false;
    }

    const { projectName, techStack } = resumeInfo.projects[index];
    
    if (!projectName || !techStack) {
      toast("Add Project Name and Tech Stack to generate summary");
      return false;
    }

    if (!API_KEY) {
      toast("Gemini API key not configured");
      return false;
    }

    return true;
  };

  const parseAIResponse = (text) => {
    try {
      const cleanedResult = text.replace(/```json|```/g, '').trim();
      const response = JSON.parse(cleanedResult);
      
      if (!response.projectSummary || !Array.isArray(response.projectSummary)) {
        throw new Error("Invalid response format");
      }
      
      return response.projectSummary;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      throw new Error("Failed to parse AI response");
    }
  };

  const GenerateSummaryFromAI = async () => {
    if (!validateProjectData()) return;
    
    setLoading(true);

    try {
      const { projectName, techStack } = resumeInfo.projects[index];
      const prompt = PROMPT
        .replace("{projectName}", projectName)
        .replace("{techStack}", techStack);

      const response = await geminiAPI({
        url: `/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
        method: 'post',
        data: {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }
      });

      const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!result) {
        throw new Error("No response from AI service");
      }

      const summaryArray = parseAIResponse(result);
      setValue(summaryArray.join("\n"));
      toast("Summary generated successfully", { type: "success" });
    } catch (error) {
      console.error("Error generating summary:", error);
      
      if (error.response?.status === 400) {
        toast("Invalid API key or request format", { type: "error" });
      } else if (error.response?.status === 429) {
        toast("Rate limit exceeded. Please try again later", { type: "error" });
      } else {
        toast(error.message || "Error generating summary", { type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (e) => {
    const updatedValue = e.target.value;
    setValue(updatedValue);
    onRichTextEditorChange(updatedValue);
  };

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Summary</label>
        <Button
          variant="outline"
          size="sm"
          onClick={GenerateSummaryFromAI}
          disabled={loading}
          className="flex gap-2 border-primary text-primary"
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
      <EditorProvider>
        <Editor value={value} onChange={handleEditorChange}>
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
}

export default SimpleRichTextEditor;