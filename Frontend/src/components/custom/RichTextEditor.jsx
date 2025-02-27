import React, { useEffect, useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnUnderline,
  Separator,
} from "react-simple-wysiwyg";

const PROMPT = `Create a JSON object with the following fields:
    "position_Title": A string representing the job title.
    "experience": An array of strings, each representing a bullet point describing relevant experience for the given job title in HTML format.
For the Job Title "{positionTitle}", create a JSON object with the following fields:
The experience array should contain 5-7 bullet points. Each bullet point should be a concise description of a relevant skill, responsibility, or achievement.`;

function RichTextEditor({ onRichTextEditorChange = () => {}, index = 0, resumeInfo }) {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(`summary-${index}`) || resumeInfo?.experience[index]?.workSummary || "";
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof onRichTextEditorChange === "function") {
      onRichTextEditorChange(value);
    }
  }, [value, onRichTextEditorChange]);

  const handleValueChange = (newValue) => {
    setValue(newValue);
    onRichTextEditorChange(newValue);
    localStorage.setItem(`summary-${index}`, newValue);
  };

  const GenerateSummaryFromAI = async () => {
    if (!resumeInfo?.experience[index]?.title) {
      toast("Please Add Position Title");
      return;
    }
    setLoading(true);

    const prompt = PROMPT.replace("{positionTitle}", resumeInfo.experience[index].title);

    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAIeShHBvjkRYmj01PbthUBX-JiBYDFUXU",
        method: "post",
        data: { contents: [{ parts: [{ text: prompt }] }] },
      });

      const result = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (result) {
        const cleanedResult = result.replace(/```json|```/g, "").trim();

        try {
          const parsedResult = JSON.parse(cleanedResult);
          const experience = parsedResult.experience || parsedResult.experience_bullets;

          if (experience && Array.isArray(experience)) {
            const generatedSummary = experience.join(" ");
            handleValueChange(generatedSummary);
            toast("Experience Generated", "success");
          } else {
            toast("Invalid AI response format", "error");
          }
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          toast("Error: Invalid JSON response", "error");
        }
      } else {
        toast("Failed to generate experience", "error");
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast("Error generating experience", `${error.message}`);
    } finally {
      setLoading(false);
    }
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
        <Editor
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
        >
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

export default RichTextEditor;
