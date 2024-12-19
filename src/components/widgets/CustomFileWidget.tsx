import React, { useState } from "react";

const CustomFileWidget = ({ value, onChange }: any) => {
  const [fileName, setFileName] = useState(value ? value.name : "");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("herer is the file", file);
    if (file) {
      setFileName(file.name);
      onChange(file); // Pass the file object to rjsf
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {fileName && <p>Selected file: {fileName}</p>}
    </div>
  );
};

export default CustomFileWidget;
