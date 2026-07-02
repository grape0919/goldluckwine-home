import { useEffect, useState } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

interface ImageUploadItemProps {
  /** 기존 이미지 URL (수정 시) */
  value?: string | File;
  onChange?: (value: string | File | undefined) => void;
}

/**
 * Form.Item 안에서 쓰는 단일 이미지 업로더.
 * - 기존 값(문자열 URL)은 미리보기로 노출
 * - 새 파일 선택 시 File 객체를 값으로 전달 → 저장 시점에 Storage 업로드
 */
const ImageUploadItem = ({ value, onChange }: ImageUploadItemProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (typeof value === 'string' && value) {
      setFileList([
        { uid: '-1', name: value.split('/').pop() ?? 'image', url: value },
      ]);
    } else if (!value) {
      setFileList([]);
    }
  }, [value]);

  return (
    <Upload
      accept='image/*'
      maxCount={1}
      listType='picture'
      fileList={fileList}
      beforeUpload={(file) => {
        setFileList([
          { uid: file.uid, name: file.name, originFileObj: file } as UploadFile,
        ]);
        onChange?.(file);
        return false; // 자동 업로드 방지 — 저장 시점에 업로드
      }}
      onRemove={() => {
        setFileList([]);
        onChange?.(undefined);
      }}
    >
      <Button icon={<UploadOutlined />}>이미지 선택</Button>
    </Upload>
  );
};

export default ImageUploadItem;
