# Security Spec

## Data Invariants
- A `Project` ownerId must always be the uid of the creator.
- A `Task` cannot exist without a valid parent Project that the user owns.
- A `Server` ownerId must match the user.
- A `Service` ownerId must match the user.
- A `Credential` ownerId must match the user.
- A `ShareLink` must maintain its ownerId.
- `AccessLog` instances can be created anonymously because anyone visiting a public share link has their IP logged.

## The Dirty Dozen Payloads
1. ID Poisoning: Inserting 10MB string into projectId.
2. Ownership spoofing: Trying to create a project where ownerId is another user's uid.
3. Update-Gap Leak: Sending an update payload to a credential that includes a ghost field `isAdmin: true` along with legitimate fields.
4. Relational Orphan: Creating a task for a project ID that does not exist.
5. Cross-Tenant Write: Creating a task for a project ID that belongs to another user.
6. Privilege Escalation: Trying to change the `ownerId` of an existing project via update.
7. Terminal State Reversal: Updating a `Task` status from `done` back to `todo` without the proper action condition.
8. Unverified Email Access: An attacker tries to write data using a token where `email_verified == false`.
9. PII Exfiltration: An authenticated user tries to run a list query for all users.
10. Unbounded Array DOS: Trying to push 10,000 array elements into a list field.
11. Timestamp Forgery: Supplying a client timestamp to `createdAt` instead of using `request.time`.
12. Denial of Wallet via Logs: Spamming 1MB strings into the `userAgent` field of the `logs` collection.

## Test Runner
The test runner ensures these conditions are blocked.
