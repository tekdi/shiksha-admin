import { RJSFSchema, RegistryFieldsType, WidgetProps } from "@rjsf/utils";
import { FormControl, FormGroup, FormLabel, OutlinedInput } from "@mui/material";
import { useTheme } from '@mui/material/styles';

const CustomImageWidget = ({ value = [], onChange, label }: WidgetProps<any, RJSFSchema, any>) => {
  const theme = useTheme<any>();

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            onChange([...value, reader.result]); // Add the new image to the value array
          }
        };
        reader.readAsDataURL(files[0]);
      }
    };
  
    const handleRemoveImage = (index: number) => {
      const updatedImages = value.filter((_: string, i: number) => i !== index); // Remove the selected image
      onChange(updatedImages);
    };
  
    return (
      <div>
        <FormLabel component="legend">{label}</FormLabel>
        <FormControl variant="outlined" fullWidth style={{ marginTop: '10px' }}>
          <OutlinedInput
            type="file"
            inputProps={{
              accept: 'image/*',
              multiple: true,
            }}
            onChange={handleImageChange}
          />
        </FormControl>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '10px',
            flexWrap: 'wrap',
          }}
        >
          {value.map((src: any, index: any) => (
            <div
              key={index}
              style={{
                position: 'relative',
                display: 'inline-block',
                width: 'auto',
                maxWidth: '120px',
                maxHeight: '120px',
              }}
            >
              <img
                src={src}
                alt={`Uploaded Preview ${index}`}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '5px',
                  border: '1px solid'+theme.palette.secondary[400],
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                style={{
                  position: 'absolute',
                  top: '5%',
                  right: '5%',
                  background:  theme.palette.error.main,
                  color: theme.palette.warning.A400,
                  border: 'none',
                  borderRadius: '50%',
                  width: '20%',
                  height: '20%',
                  minWidth: '16px',
                  minHeight: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transform: 'translate(50%, -50%)',
                  fontSize: '0.8rem',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  export default CustomImageWidget;
