import type { FlashMessageForm } from '@cocooning/couple-client-business-logic/messaging';

export type MessageCommandCall =
    | {
          readonly operation: 'sendFlashMessage';
          readonly form: FlashMessageForm;
      }
    | {
          readonly operation: 'sendInstantPhoto';
          readonly fileName: string;
      }
    | {
          readonly operation: 'answerPhotoPrompt';
          readonly photoPromptId: string;
          readonly fileName: string;
      }
    | {
          readonly operation: 'withdrawFlashMessage' | 'withdrawInstantPhoto';
          readonly id: string;
      };
