import axios, { AxiosError, AxiosResponse } from 'axios';
import SelectElement, { SelectOption } from 'components/form/select/SelectElement';
import Pill from 'components/pill/Pill';
import i18n from 'config/i18n';
import { getCookie } from 'external';
import React from 'react';
import { TembaSelectStyle } from 'temba/TembaSelect';
import { createUUID, renderIf } from 'utils';
import styles from './attachments.module.scss';
import TextInputElement, { TextInputStyle } from 'components/form/textinput/TextInputElement';
import { ValidationFailure } from 'store/nodeEditor';
import { ImCross } from 'react-icons/im';
import Loading from 'components/loading/Loading';

export interface Attachment {
  type: string;
  url: string;
  uploaded?: boolean;
  validationFailures?: ValidationFailure[];
  valid?: boolean;
}

const MAX_ATTACHMENTS = 1;

export const TYPE_OPTIONS: SelectOption[] = [
  { value: 'image', name: i18n.t('forms.image_url', 'Image URL') },
  { value: 'audio', name: i18n.t('forms.audio_url', 'Audio URL') },
  { value: 'video', name: i18n.t('forms.video_url', 'Video URL') },
  { value: 'sticker', name: i18n.t('forms.sticker_url', 'Sticker URL') },
  { value: 'document', name: i18n.t('forms.pdf_url', 'PDF Document URL') }
];

const EXTENDED_TYPE_OPTIONS: SelectOption[] = [
  ...TYPE_OPTIONS,
  { value: 'expression', name: i18n.t('forms.expression', 'Expression') }
];

const NEW_TYPE_OPTIONS = [
  { value: 'upload', name: i18n.t('forms.upload_attachment', 'Upload Attachment') }
].concat(EXTENDED_TYPE_OPTIONS);

export const validateURL = (endpoint: any, body: any, msgForm: any) => {
  axios
    .get(`${endpoint}?url=${body.url}&type=${body.type}`)
    .then(response => {
      if (response.data.is_valid) {
        msgForm.attachmentValidate(body, false);
      } else {
        msgForm.attachmentValidate(body, true, [{ message: response.data.message }]);
      }
    })
    .catch(error => {
      msgForm.attachmentValidate(body, true, [
        { message: `The attachment url is invalid!: ${error.toString()}` }
      ]);
    });
};

// we would prefer that attachmetns be entirely stateless, but we have this
// tiny bit of state for simplicity with the reasonable assumption that only
// one batch of attachments are rendered at once
let filePicker: any;

const getAttachmentTypeOption = (type: string): SelectOption => {
  return EXTENDED_TYPE_OPTIONS.find((option: SelectOption) => option.value === type);
};

export const renderUpload = (
  index: number,
  attachment: Attachment,
  onAttachmentRemoved: (index: number) => void,
  onAttachmentChanged: any
): JSX.Element => {
  return (
    <div
      className={styles.url_attachment}
      key={index > -1 ? 'url_attachment_' + index : createUUID()}
    >
      <div className={styles.attachment_container}>
        <div className={styles.type}>
          <SelectElement
            key={'attachment_type_' + index}
            style={TembaSelectStyle.small}
            name={i18n.t('forms.type_options', 'Type Options')}
            placeholder={i18n.t('forms.add_attachment', 'Add Attachment')}
            entry={{
              value: index > -1 ? getAttachmentTypeOption(attachment.type) : null
            }}
            onChange={(option: any) => {
              onAttachmentChanged(index, option.value, index === -1 ? '' : attachment.url);
            }}
            options={EXTENDED_TYPE_OPTIONS}
          />
        </div>
        <div className={styles.type_choice}>
          <SelectElement
            key={'attachment_type_' + index}
            name={i18n.t('forms.type', 'Type')}
            style={TembaSelectStyle.small}
            entry={{
              value: {
                name:
                  attachment.url && attachment.url.length > 20
                    ? `${attachment.url.slice(0, 20)}...`
                    : attachment.url
              }
            }}
            options={EXTENDED_TYPE_OPTIONS}
            disabled={true}
          />
        </div>
      </div>
      <div className={styles.url}>
        <div className={styles.upload} style={{ display: 'flex' }}>
          <Pill
            icon="download"
            text="Download"
            large={true}
            onClick={() => {
              window.open(attachment.url, '_blank');
            }}
            style={{ marginRight: '7px' }}
          />
          <Pill
            icon="x"
            text="Remove"
            large={true}
            onClick={() => {
              onAttachmentRemoved(index);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const renderAttachment = (
  attachmentsEnabled: boolean,
  index: number,
  attachment: Attachment,
  uploadInProgress: boolean,
  uploadError: string,
  onAttachmentChanged: (index: number, type: string, url: string) => void,
  onAttachmentRemoved: (index: number) => void
): JSX.Element => {
  const isEmptyOption = attachment.type === '';
  const isUploadError = uploadError && uploadError.length > 0;
  return (
    <>
      <div className={styles.url_attachment} key={'url_attachment_' + index}>
        <div className={styles.type_choice}>
          <SelectElement
            key={'attachment_type_' + index}
            style={TembaSelectStyle.small}
            name={i18n.t('forms.type_options', 'Type Options')}
            placeholder={i18n.t('forms.add_attachment', 'Add Attachment')}
            entry={{
              value: isEmptyOption ? null : getAttachmentTypeOption(attachment.type)
            }}
            onChange={(option: any) => {
              if (option.value === 'upload') {
                window.setTimeout(() => {
                  filePicker.click();
                }, 0);
              } else {
                onAttachmentChanged(index, option.value, index === -1 ? '' : attachment.url);
              }
            }}
            options={attachmentsEnabled ? NEW_TYPE_OPTIONS : EXTENDED_TYPE_OPTIONS}
          />
        </div>
        {renderIf(isEmptyOption && uploadInProgress)(
          <temba-loading id={styles.upload_in_progress} units="3" size="8"></temba-loading>
        )}
        {renderIf(isEmptyOption && isUploadError)(
          <div className={styles.upload_error}>{uploadError}</div>
        )}
        {isEmptyOption ? null : (
          <>
            <div className={styles.url}>
              <TextInputElement
                placeholder="URL"
                name={i18n.t('forms.url', 'URL')}
                style={TextInputStyle.small}
                onChange={(value: string) => {
                  onAttachmentChanged(index, attachment.type, value);
                }}
                entry={{ value: attachment.url }}
                autocomplete={true}
              />
            </div>
            <div className={styles.remove}>
              <Pill
                icon="x"
                text=" Remove"
                large={true}
                onClick={() => {
                  onAttachmentRemoved(index);
                }}
              />
            </div>
          </>
        )}
      </div>
      <div>
        {attachment.valid && !attachment.validationFailures && attachment.url && (
          <div className={styles.loading}>
            Checking URL validity
            <Loading size={10} units={3} color="#999999" />
          </div>
        )}
        {attachment.validationFailures && attachment.validationFailures.length > 0 && (
          <div className={styles.error}>
            <ImCross className={styles.crossIcon} />
            {attachment.validationFailures[0].message}
          </div>
        )}
      </div>
    </>
  );
};

export const handleUploadFile = (
  endpoint: string,
  files: FileList,
  onLoading: (isUploading: boolean) => void,
  onSuccess: (response: AxiosResponse) => void,
  onFailure: (error: AxiosError) => void
): void => {
  // if we have a csrf in our cookie, pass it along as a header
  const csrf = getCookie('csrftoken');
  const headers: any = csrf ? { 'X-CSRFToken': csrf } : {};

  // mark us as ajax
  headers['X-Requested-With'] = 'XMLHttpRequest';

  if (files && files.length > 0) {
    onLoading(true);
    const data = new FormData();
    data.append('media', files[0]);
    const mediaName = files[0].name;
    const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);
    data.append('extension', extension);
    axios
      .post(endpoint, data, { headers })
      .then(response => {
        onSuccess(response);
      })
      .catch(error => {
        onFailure(error);
      });
  } else {
    onLoading(false);
  }
};

export const renderAttachments = (
  endpoint: string,
  attachmentsEnabled: boolean,
  attachments: Attachment[],
  uploadInProgress: boolean,
  uploadError: string,
  onUploading: (isUploading: boolean) => void,
  onUploaded: (response: AxiosResponse) => void,
  onUploadFailed: (error: AxiosError) => void,
  onAttachmentChanged: (index: number, value: string, url: string) => void,
  onAttachmentRemoved: (index: number) => void
): JSX.Element => {
  const renderedAttachments = attachments.map((attachment, index: number) =>
    attachment.uploaded
      ? renderUpload(index, attachment, onAttachmentRemoved, () => {})
      : renderAttachment(
          attachmentsEnabled,
          index,
          attachment,
          uploadInProgress,
          uploadError,
          onAttachmentChanged,
          onAttachmentRemoved
        )
  );

  const emptyOption =
    attachments.length < MAX_ATTACHMENTS
      ? renderAttachment(
          attachmentsEnabled,
          attachments.length,
          { url: '', type: '' },
          uploadInProgress,
          uploadError,
          onAttachmentChanged,
          onAttachmentRemoved
        )
      : null;

  return (
    <>
      <p>
        {i18n.t(
          'forms.send_msg_summary',
          'Add an attachment to each message. The attachment can be a file you upload or a dynamic URL using expressions and variables from your Flow.',
          { count: MAX_ATTACHMENTS }
        )}
      </p>
      {renderedAttachments}
      {emptyOption}
      <input
        style={{
          display: 'none'
        }}
        ref={ele => {
          filePicker = ele;
        }}
        type="file"
        onChange={e => {
          handleUploadFile(endpoint, e.target.files, onUploading, onUploaded, onUploadFailed);
        }}
      />
    </>
  );
};
