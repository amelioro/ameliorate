BEGIN;

-- thanks https://stackoverflow.com/a/70742041/8409296
CREATE COLLATION english_ci (
   PROVIDER = 'icu',
   LOCALE = 'en-US@colStrength=secondary',
   DETERMINISTIC = FALSE
);

COMMIT;
