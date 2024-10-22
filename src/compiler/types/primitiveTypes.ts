export const INBOX_CODE = 'inbox';

export const Inbox = Symbol(INBOX_CODE);

export const OUTBOX_CODE = 'outbox';

export const Outbox = Symbol(OUTBOX_CODE);

export const Hand = Symbol('Hand');

export type Identifier = string;

export type Value = string | number;
