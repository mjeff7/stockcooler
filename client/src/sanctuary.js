import $ from 'sanctuary-def';
import Future from 'fluture/es5';
import {env, create} from 'sanctuary';

const FutureType = $.BinaryType(
    Future.name,
    'https://github.com/fluture-js/Fluture#future',
    Future.isFuture,
    Future.extractLeft,
    Future.extractRight
);

const S = create({checkTypes: true, env: env.concat([FutureType])});

module.exports = S;
