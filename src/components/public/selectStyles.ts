import type { CSSObjectWithLabel, StylesConfig } from "react-select";

export interface PublicSelectOption {
    value: string;
    label: string;
}

/* Storefront form styling: cream borders, accent focus, ivory field. */
export function publicSelectStyles<T>(): StylesConfig<T, false> {
    return {
        control: (base, state) => ({
            ...base,
            minHeight: "50px",
            borderRadius: "0.75rem",
            backgroundColor: state.isFocused ? "#fff" : "rgba(255, 249, 233, 0.4)",
            borderColor: state.isFocused ? "#ECA40C" : "#F4E4D4",
            boxShadow: "none",
            fontSize: "0.875rem",
            "&:hover": { borderColor: "#ECA40C" },
        }),
        option: (base, state) => ({
            ...base,
            fontSize: "0.8125rem",
            backgroundColor: state.isSelected
                ? "#ECA40C"
                : state.isFocused
                    ? "#F4E4D4"
                    : "#fff",
            color: state.isSelected ? "#fff" : "#0A0A0A",
            cursor: "pointer",
        }),
        placeholder: (base) => ({ ...base, color: "rgba(122, 98, 66, 0.6)" }),
        menu: (base) => ({ ...base, zIndex: 60, overflow: "hidden" }),
        menuPortal: (base) => ({ ...base, zIndex: 60 }),
        indicatorSeparator: () => ({ display: "none" }),
        valueContainer: (base) => ({ ...base, padding: "0 12px" }),
    };
}

/**
 * Compact pill used for inline toolbar controls such as the shop sort — it
 * replaces a small `rounded-full` native select, so it is shorter and rounder
 * than the form variant above rather than a full-height field.
 */
export function publicPillSelectStyles<T>(): StylesConfig<T, false> {
    const base = publicSelectStyles<T>();
    return {
        ...base,
        control: (styles, state) => ({
            ...(base.control?.(styles, state) as CSSObjectWithLabel),
            minHeight: "38px",
            borderRadius: "9999px",
            backgroundColor: "#fff",
            fontSize: "0.75rem",
            fontWeight: 600,
        }),
        singleValue: (styles) => ({ ...styles, color: "#0A0A0A" }),
        option: (styles, state) => ({
            ...(base.option?.(styles, state) as CSSObjectWithLabel),
            fontSize: "0.75rem",
            fontWeight: 600,
        }),
        menu: (styles) => ({ ...styles, zIndex: 60, overflow: "hidden", fontSize: "0.75rem" }),
        dropdownIndicator: (styles) => ({ ...styles, padding: "4px 8px" }),
        valueContainer: (styles) => ({ ...styles, padding: "0 6px 0 12px" }),
    };
}

/** Narrow variant used by the phone dial-code picker. */
export function publicCompactSelectStyles<T>(): StylesConfig<T, false> {
    const base = publicSelectStyles<T>();
    return {
        ...base,
        control: (styles, state) => ({
            ...(base.control?.(styles, state) as CSSObjectWithLabel),
            backgroundColor: "#fff",
        }),
        menu: (styles) => ({ ...styles, width: 260, zIndex: 60 }),
        dropdownIndicator: (styles) => ({ ...styles, padding: "4px 6px" }),
        valueContainer: (styles) => ({ ...styles, padding: "0 8px" }),
    };
}
