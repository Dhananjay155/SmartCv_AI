import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getResumeData } from "@/Services/resumeAPI";
import ResumePreview from "../../edit-resume/components/PreviewPage";
import { useDispatch } from "react-redux";
import { addResumeData } from "@/features/resume/resumeFeatures";
import { RWebShare } from "react-web-share";
import { toast } from "sonner";

function ViewResume() {
  const { resume_id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchResumeInfo();
  }, []);

  const fetchResumeInfo = async () => {
    const response = await getResumeData(resume_id);
    dispatch(addResumeData(response.data));
  };

  const HandleDownload = () => {
    window.print();
  };

  return (
    <div className="flex flex-col justify-center items-center px-4 md:px-10 lg:px-20">
      <div id="noPrint" className="w-full max-w-4xl">
        <div className="my-10 text-center">
          <h2 className="text-2xl font-medium">
            Congrats! Your AI-generated Resume is ready!
          </h2>
          <p className="text-gray-400">
            Download your resume or share your unique resume URL with others.
          </p>
          <div className="flex flex-col md:flex-row justify-center md:justify-between px-4 md:px-20 lg:px-32 my-10 gap-4">
            <Button onClick={HandleDownload}>Download</Button>
            <RWebShare
              data={{
                text: "Hello, this is my resume",
                url: import.meta.env.VITE_BASE_URL + "/dashboard/view-resume/" + resume_id,
                title: "Flamingos",
              }}
              onClick={() => toast("Resume Shared Successfully")}
            >
              <Button>Share</Button>
            </RWebShare>
          </div>
        </div>
      </div>
      <div className="bg-white dark:text-black rounded-lg p-6 md:p-8 shadow-lg w-full max-w-4xl">
        <ResumePreview />
      </div>
    </div>
  );
}

export default ViewResume;
