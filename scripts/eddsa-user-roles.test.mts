import assert from 'node:assert/strict';
import {
  mergeEdDSARoles,
  parseEdDSAUsersBody,
  resolveRoleNames,
  singleRoleId,
} from '../src/data/eddsaUserRoles.ts';

const sample = {
  users: [
    {
      id: '17',
      reference_id: '04FmPhCvG3pxYbKyfmFULF',
      name: 'heron123',
      cli_abbr: 'yyds',
      email_addr: 'heron123@outlook.com',
      enabled: '1',
      role_id: ['admin', '04FxowNH1n2CAAux9y6Odh'],
    },
  ],
  roles: [
    {
      name: 'tom',
      description: '',
      lrid: '04FxowNH1n2CAAux9y6Odh',
    },
  ],
};

const parsed = parseEdDSAUsersBody(sample);
assert.equal(parsed.users.length, 1);
assert.equal(parsed.users[0].id, '17');
assert.equal(parsed.users[0].reference_id, '04FmPhCvG3pxYbKyfmFULF');
assert.deepEqual(parsed.users[0].roleIds, ['admin', '04FxowNH1n2CAAux9y6Odh']);
assert.equal(parsed.roles.length, 1);
assert.equal(parsed.roles[0].name, 'tom');
assert.equal(parsed.roles[0].referenceId, '04FxowNH1n2CAAux9y6Odh');
assert.deepEqual(resolveRoleNames(parsed.users[0].roleIds, parsed.roles), ['admin', 'tom']);
assert.equal(singleRoleId(parsed.users[0].roleIds, parsed.roles), '04FxowNH1n2CAAux9y6Odh');
assert.equal(singleRoleId(['admin'], parsed.roles), 'admin');
assert.equal(singleRoleId([], parsed.roles), '');

assert.deepEqual(
  resolveRoleNames(['04FxowNH1n2CAAux9y6Odh', '04FxowNH1n2CAAux9y6Odh', 'tom'], parsed.roles),
  ['tom']
);

assert.deepEqual(resolveRoleNames(['  admin  ', ''], parsed.roles), ['admin']);
assert.deepEqual(resolveRoleNames([], parsed.roles), []);

const single = parseEdDSAUsersBody({
  users: [{ id: '9', name: 'a', role_id: 'admin' }],
  roles: [],
});
assert.deepEqual(single.users[0].roleIds, ['admin']);
assert.deepEqual(resolveRoleNames(single.users[0].roleIds, single.roles), ['admin']);

const empty = parseEdDSAUsersBody(null);
assert.deepEqual(empty.users, []);
assert.deepEqual(empty.roles, []);

const dropped = parseEdDSAUsersBody({
  users: [{ name: 'missing-id' }, { id: '1', role_id: ['04FxowNH1n2CAAux9y6Odh'] }],
  roles: [{ description: 'no name', lrid: 'x' }, { name: 'tom', lrid: '04FxowNH1n2CAAux9y6Odh' }],
});
assert.equal(dropped.users.length, 1);
assert.equal(dropped.roles.length, 1);
assert.deepEqual(resolveRoleNames(dropped.users[0].roleIds, dropped.roles), ['tom']);

const merged = mergeEdDSARoles(
  [{ name: 'tom', referenceId: '04FxowNH1n2CAAux9y6Odh' }],
  [{ name: 'keeper', referenceId: 'other' }, { name: 'old-tom', referenceId: '04FxowNH1n2CAAux9y6Odh' }]
);
assert.deepEqual(
  merged.map((role) => role.name),
  ['keeper', 'tom']
);

console.log('eddsa user roles ok');
