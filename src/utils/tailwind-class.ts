
/**
 * Converts a Tailwind CSS variable name to its corresponding class name
 * @param variableName The CSS variable name (e.g. "background-color-something" or "spacing-something")
 * @returns The corresponding Tailwind class name (e.g. "bg-something" or "gap-something")
 */
export function variableToTailwindClassName(variableName: string): string {
    // Remove the leading "--" if present
    const cleanName = variableName.startsWith('--') ? variableName.slice(2) : variableName;

    // Split the variable name into parts
    const parts = cleanName.split('-');

    let className = "";
    let multiplePrefix = "";

    // Handle color-specific utilities first
    if (parts[1] === 'color') {
        if (parts[0] === 'background') {
            className = `bg-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'text') {
            className = `text-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'border') {
            className = `border-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'ring') {
            className = `ring-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'divide') {
            className = `divide-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'outline') {
            className = `outline-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'stroke') {
            className = `stroke-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'fill') {
            className = `fill-${parts.slice(2).join('-')}`;
        }
    }

    // Handle other special cases and mappings
    if (!className) {
        if (parts[0] === 'color') {
            className = `${parts.slice(1).join('-')}`;
            multiplePrefix = "[text|bg|...]-"
        } else if (parts[0] === 'spacing') {
            className = `${parts.slice(1).join('-')}`;
            multiplePrefix = "[gap|m|p|...]-"
        } else if (parts[0] === 'text') {
            className = `text-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'font') {
            if (parts[1] === 'weight') {
                className = `font-${parts.slice(2).join('-')}`;
            } else if (parts[1] === 'family') {
                className = `font-${parts.slice(2).join('-')}`;
            } else {
                className = `font-${parts.slice(1).join('-')}`;
            }
        } else if (parts[0] === 'radius') {
            className = `rounded-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'shadow') {
            if (parts[1] === 'inset') {
                className = `shadow-inner-${parts.slice(2).join('-')}`;
            } else if (parts[1] === 'drop') {
                className = `drop-shadow-${parts.slice(2).join('-')}`;
            } else {
                className = `shadow-${parts.slice(1).join('-')}`;
            }
        } else if (parts[0] === 'blur') {
            className = `blur-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'tracking') {
            className = `tracking-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'leading') {
            className = `leading-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'opacity') {
            className = `opacity-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'z') {
            className = `z-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'border') {
            if (parts[1] === 'width') {
                className = `border-${parts.slice(2).join('-')}`;
            } else {
                className = `border-${parts.slice(1).join('-')}`;
            }
        } else if (parts[0] === 'duration') {
            className = `duration-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'size') {
            className = `size-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'space') {
            className = `space-${parts.slice(1).join('-')}`;
        } else if (parts[0] === 'line' && parts[1] === 'height') {
            className = `leading-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'letter' && parts[1] === 'spacing') {
            className = `tracking-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'font' && parts[1] === 'size') {
            className = `text-${parts.slice(2).join('-')}`;
        } else if (parts[0] === 'typography') {
            className = `typography-${parts.slice(1).join('-')}`;
        }
    }

    // If no specific class was found, use the original parts
    if (!className) {
        className = parts.join('-');
    }

    // Return the formatted class name with dot prefix, sanitized name
    return "." + multiplePrefix + className;
} 