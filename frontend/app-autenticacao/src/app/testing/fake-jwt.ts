/** Monta um JWT falso (assinatura irrelevante) para os testes do frontend. */
export function fakeJwt(expiraEmSegundos: number): string {
  const base64Url = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

  const exp = Math.floor(Date.now() / 1000) + expiraEmSegundos;

  return [
    base64Url({ alg: 'HS256', typ: 'JWT' }),
    base64Url({ sub: 'aluno@email.com', roles: ['ROLE_USER'], exp }),
    'assinatura'
  ].join('.');
}
