-- NyansertDemokrati - Opinion Tracking Schema
-- SCD2 (Slowly Changing Dimension Type 2) for vote history

-- Users (predefined, no auth)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Claims (predefined)
CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT
);

-- Votes (SCD Type 2) - full history of vote changes
CREATE TABLE claim_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claim_id INTEGER NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    vote_value SMALLINT NOT NULL CHECK (vote_value BETWEEN -2 AND 2),
    claim_quality BOOLEAN NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    is_current BOOLEAN NOT NULL DEFAULT true
);
-- Claim Quality (SCD Type 2)
CREATE TABLE claim_quality_votes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    claim_id INTEGER NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    quality SMALLINT NOT NULL CHECK (quality BETWEEN -2 AND 2),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    is_current BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (claim_id, valid_from)
);

-- Exactly one current vote per user per claim
CREATE UNIQUE INDEX votes_one_current_per_user_claim
    ON claim_votes (user_id, claim_id)
    WHERE is_current = true;

-- Index for current vote lookups and distribution queries
CREATE INDEX votes_current_lookup ON claim_votes (claim_id, is_current) WHERE is_current = true;

-- Seed data: predefined users
INSERT INTO users (id, name) VALUES
    (1,'Dennis'),
    (2,'Bob'),
    (3,'Carol'),
    (4,'Dave'),
    (5,'Eve');

-- Seed data: predefined claims
INSERT INTO claims (title, description) VALUES
    ('Klima er en av de viktigste politiske problemene Norge står ovenfor i dag', 'Klima er viktig for mange i dag. Noen mener vi må gjøre noe.'),
    ('Skattenivået i norge er for høyt', 'Norge har et høyt skattenivå i forhold til andre land. Noen mener vi bør redusere skattenivået.'),
    ('Offentlig helsevesen bør prioriteres høyere', 'Debatten om helsevesenets ressurser og prioriteringer.'),
    ('Norge bør satse mer på atomkraft', 'Spørsmål om energimiks og atomkraft som del av løsningen.');

-- Seed data: dummy claim quality opinions (user_id, claim_id, quality -2 to 2)
INSERT INTO claim_quality_votes (user_id, claim_id, quality, valid_from, valid_to, is_current) VALUES
    (1, 1, 1, '2025-02-01 10:00:01+00', NULL, true),
    (2, 1, -1, '2025-02-01 10:00:02+00', NULL, true),
    (3, 1, 2, '2025-02-01 10:00:03+00', NULL, true),
    (1, 2, 0, '2025-02-01 10:00:04+00', NULL, true),
    (2, 2, 1, '2025-02-01 10:00:05+00', NULL, true),
    (4, 2, -2, '2025-02-01 10:00:06+00', NULL, true),
    (1, 3, 2, '2025-02-01 10:00:07+00', NULL, true),
    (3, 3, 1, '2025-02-01 10:00:08+00', NULL, true),
    (5, 3, 0, '2025-02-01 10:00:09+00', NULL, true),
    (2, 4, -1, '2025-02-01 10:00:10+00', NULL, true),
    (4, 4, 1, '2025-02-01 10:00:11+00', NULL, true);
