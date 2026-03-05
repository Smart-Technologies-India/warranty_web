import React from "react";
import { Input } from "antd";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";

type TextInputProps<T extends FieldValues> = {
  name: Path<T>;
  title?: string;
  placeholder?: string;
  required?: boolean;
  onlynumber?: boolean;
  asNumber?: boolean;
  numdes?: boolean;
  disable?: boolean;
  maxlength?: number;
  extratax?: string;
};

export function TextInput<T extends FieldValues>(props: TextInputProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Get the error for this specific field
  const error = errors[props.name as keyof typeof errors];
  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field }) => (
        <>
          {props.title && (
            <div className="w-full flex flex-wrap mb-1">
              <label htmlFor={props.name} className="text-sm font-normal">
                {props.title}
                {props.required && <span className="text-rose-500">*</span>}
              </label>
              {props.extratax && (
                <p className="text-red-500 text-sm">{props.extratax}</p>
              )}
            </div>
          )}

          <Input
            showCount={props.maxlength ? true : undefined}
            maxLength={props.maxlength ?? undefined}
            status={error ? "error" : undefined}
            className="w-full"
            value={props.onlynumber ? (field.value || "") : field.value}
            disabled={props.disable ?? false}
            onChange={(e) => {
              if (!e) return;
              let { value } = e.target;

              if (props.numdes) {
                value = value.replace(/[^0-9.]/g, "");
              }

              if (props.onlynumber) {
                value = value.replace(/[^0-9]/g, "");
                if (props.asNumber) {
                  field.onChange(value === "" ? undefined : Number(value));
                } else {
                  field.onChange(value);
                }
                return;
              }
              
              if (props.asNumber) {
                field.onChange(value === "" ? undefined : Number(value));
              } else {
                field.onChange(value);
              }
            }}
            placeholder={props.placeholder ?? undefined}
          />
          {error && (
            <p className="text-xs text-red-500">{error.message?.toString()}</p>
          )}
        </>
      )}
    />
  );
}
