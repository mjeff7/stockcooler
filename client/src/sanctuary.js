import $ from 'sanctuary-def';
import Future from 'fluture/es5';
import {create, env} from 'sanctuary';

const FutureType = $.BinaryType(
    Future.name,
    'https://github.com/fluture-js/Fluture#future',
    Future.isFuture,
    Future.extractLeft,
    Future.extractRight
);

const S = create({checkTypes: true, env: env.concat([FutureType])});

/* eslint-env node */
module.exports = S;
