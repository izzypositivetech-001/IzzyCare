"use client"
import { Control } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form"
import { Input } from "@/components/input"
import { Form } from "react-hook-form"
import { FormFieldType } from "./forms/PatientForm"
import Image from "next/image"
import 'react-phone-number-input/style.css'
import dynamic from 'next/dynamic'
import type { Value as PhoneInputValue } from 'react-phone-number-input' 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"


interface CustomProps {
  control: Control<any>,
  fieldType: FormFieldType,
  name: string,
  label?: string,
  placeholder?: string,
  iconAlt?: string,
  iconSrc?: string,
  disabled?: boolean,
  dateFormat?: string,
  showTimeTest?: boolean,
  showTimeSelect?: boolean,
  children?: React.ReactNode,
  renderSkeleton?: (field: any) => React.ReactNode,
}

const PhoneInput = dynamic(
  () => import('react-phone-number-input'),
  { 
    ssr: false,
    loading: () => <Input placeholder="Loading phone input..." />
  }
)

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
  const { fieldType, iconAlt, placeholder, iconSrc, disabled, dateFormat, showTimeSelect, renderSkeleton } = props
  
  switch (fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="flex items-center rounded-md border border-dark-500 bg-dark-400">
          {iconSrc && (
            <div className="flex items-center justify-center ml-3 w-6 h-6">
              <Image 
                src={iconSrc}
                alt={iconAlt || 'icon'}
                width={24}
                height={24}
                className="aspect-square object-contain"
                priority
              />
            </div>
          )}
          <FormControl>
            <Input 
              placeholder={placeholder}
              {...field}
              disabled={disabled}
              className="shad-input border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </FormControl>
        </div>
      )
      
    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput 
            defaultCountry="US"
            placeholder={placeholder}
            international
            withCountryCallingCode
            value={field.value as PhoneInputValue | undefined}
            onChange={field.onChange}
            disabled={disabled}
            className="flex w-full rounded-md border border-dark-500 bg-dark-400 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </FormControl>
      )
      case FormFieldType.TEXTAREA:
        return (
          <FormControl>
            <Textarea 
                placeholder={placeholder}
                {...field}
                className="shad-textarea"
                disabled={props.disabled}
                />
          </FormControl>
        )
      case FormFieldType.CHECKBOX:
        return ( <FormControl>
           <div className="flex items-center gap-4">
             <Checkbox 
                id={props.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                />
                <label htmlFor={props.name}
                className="checkbox-label">
                  {props.label}
                </label>
           </div>
         </FormControl>
      )
      case FormFieldType.DATE_PICKER:
        return (
          <div className="flex rounded-md border border-dark-500 bg-dark-400">
              <Image 
                  src="/assets/icons/calendar.svg"
                  height={24}
                  width={24}
                  alt="calendar"
                  className="ml-2"
                  priority
                  />

                  <FormControl>
                    <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange (date)}
                        dateFormat={dateFormat ?? "MM/dd/yyyy"}
                        showTimeSelect={showTimeSelect ?? false}
                        timeInputLabel="Time:"
                        wrapperClassName="date-picker"
                          />
                  </FormControl>
          </div>
        )
      case FormFieldType.SELECT:
        return (
          <FormControl>
            <Select onValueChange={field.onChange}
                defaultValue={field.value}>
              <FormControl >
                <SelectTrigger className="shad-select-trigger">
                <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="shad-select-content">
                {props.children}
              </SelectContent>
            </Select>
          </FormControl>
        )
      case FormFieldType.SKELETON:
        return renderSkeleton ? renderSkeleton
        (field) : null
      
    default:
      return null
  }
}

const CustomFormField = (props: CustomProps) => {
  const { control, fieldType, name, label } = props
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className="text-dark-100">{label}</FormLabel>
          )}
          <RenderField field={field} props={props} />
          <FormMessage className="shad-error text-red-500 text-xs mt-1" />
        </FormItem>
      )}
    />
  )
}

export default CustomFormField