import { initIpc } from '@ui-tars/electron-ipc/main';

const t = initIpc.create();

export const authRoute = t.router({
  login: t.procedure.input<void>().handle(async () => {}),
  signup: t.procedure.input<void>().handle(async () => {}),
  logout: t.procedure.input<void>().handle(async () => {}),
  storeToken: t.procedure.input<string>().handle(async () => {}),
  loadToken: t.procedure.input<string>().handle(async () => {}),
  clearToken: t.procedure.input<void>().handle(async () => {}),
});
