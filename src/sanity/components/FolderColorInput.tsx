import { useCallback, type ChangeEvent } from 'react';
import { set, unset, type StringInputProps } from 'sanity';

const folderColors = [
  '#FF8085',
  '#98C7A5',
  '#F5DEA0',
  '#CBDD4D',
  '#64B5F6',
  '#CE93D8',
  '#8793C0',
  '#CDB9D1',
  '#EAD7D7',
  '#D9D9D9',
  '#000000',
  '#FFFFFF',
];

const hexColorPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;

export default function FolderColorInput(props: StringInputProps) {
  const value = typeof props.value === 'string' && hexColorPattern.test(props.value) ? props.value : '#FF8085';

  const handleChange = useCallback(
    (nextValue: string) => {
      props.onChange(nextValue ? set(nextValue.toUpperCase()) : unset());
    },
    [props]
  );

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleChange(event.currentTarget.value);
    },
    [handleChange]
  );

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: 8 }}>
        {folderColors.map((color) => {
          const isSelected = color.toUpperCase() === value.toUpperCase();

          return (
            <button
              key={color}
              type="button"
              aria-label={`Wybierz kolor ${color}`}
              onClick={() => handleChange(color)}
              style={{
                width: '100%',
                aspectRatio: '1',
                cursor: 'pointer',
                border: isSelected ? '3px solid #000' : '1px solid #999',
                borderRadius: 6,
                background: color,
                boxShadow: color === '#FFFFFF' ? 'inset 0 0 0 1px #ddd' : 'none',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={handleTextChange}
          style={{ width: 56, height: 40, cursor: 'pointer' }}
        />
        <input
          type="text"
          value={props.value || ''}
          onChange={handleTextChange}
          placeholder="#FF8085"
          style={{ width: '100%', height: 40, padding: '0 12px', font: 'inherit' }}
        />
      </div>
    </div>
  );
}
