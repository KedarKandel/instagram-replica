import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <View>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 6,
            color: "#333",
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            borderWidth: 1,
            borderColor: error ? "#f44336" : "#ddd",
            padding: 15,
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: "#fff",
          },
          style,
        ]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && (
        <Text style={{ fontSize: 12, color: "#f44336", marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
};
