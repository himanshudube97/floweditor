import {
  Operator,
  OperatorMap,
  Operators,
  VISIBILITY_ONLINE,
  VISIBILITY_HIDDEN,
  FeatureFilter
} from 'config/interfaces';
import i18n from 'config/i18n';

export const intentOperatorList: Operator[] = [
  {
    type: Operators.has_top_intent,
    verboseName: i18n.t('operators.has_top_intent', 'has top intent'),
    operands: 2,
    visibility: VISIBILITY_ONLINE
  },
  {
    type: Operators.has_intent,
    verboseName: i18n.t('operators.has_intent', 'has intent'),
    operands: 2,
    visibility: VISIBILITY_ONLINE
  }
];

export const operatorConfigList: Operator[] = [
  {
    type: Operators.has_any_word,
    verboseName: i18n.t('operators.has_any_word', 'has any of the words'),
    operands: 1
  },
  {
    type: Operators.has_multiple,
    verboseName: i18n.t('operators.has_multiple', 'has multiple values'),
    operands: 1
  },
  {
    type: Operators.has_all_words,
    verboseName: i18n.t('operators.has_all_words', 'has all of the words'),
    operands: 1
  },
  {
    type: Operators.has_phrase,
    verboseName: i18n.t('operators.has_phrase', 'has the phrase'),
    operands: 1
  },
  {
    type: Operators.has_only_phrase,
    verboseName: i18n.t('operators.has_only_phrase', 'has only the phrase'),
    operands: 1
  },
  {
    type: Operators.has_beginning,
    verboseName: i18n.t('operators.has_beginning', 'starts with'),
    operands: 1
  },
  {
    type: Operators.has_text,
    verboseName: i18n.t('operators.has_text', 'has some text'),
    operands: 0,
    categoryName: 'Has Text'
  },
  {
    type: Operators.has_number,
    verboseName: i18n.t('operators.has_number', 'has a number'),
    operands: 0,
    categoryName: 'Has Number'
  },
  {
    type: Operators.has_number_between,
    verboseName: i18n.t('operators.has_number_between', 'has a number between'),
    operands: 2
  },
  {
    type: Operators.has_number_lt,
    verboseName: i18n.t('operators.has_number_lt', 'has a number below'),
    operands: 1
  },
  {
    type: Operators.has_number_lte,
    verboseName: i18n.t('operators.has_number_lte', 'has a number at or below'),
    operands: 1
  },
  {
    type: Operators.has_number_eq,
    verboseName: i18n.t('operators.has_number_eq', 'has a number equal to'),
    operands: 1
  },
  {
    type: Operators.has_number_gte,
    verboseName: i18n.t('operators.has_number_gte', 'has a number at or above'),
    operands: 1
  },
  {
    type: Operators.has_number_gt,
    verboseName: i18n.t('operators.has_number_gt', 'has a number above'),
    operands: 1
  },
  {
    type: Operators.has_date,
    verboseName: i18n.t('operators.has_date', 'has a date'),
    operands: 0,
    categoryName: i18n.t('operators.has_date_category', 'Has Date')
  },
  {
    type: Operators.has_date_lt,
    verboseName: i18n.t('operators.has_date_lt', 'has a date before'),
    operands: 1
  },
  {
    type: Operators.has_date_eq,
    verboseName: i18n.t('operators.has_date_eq', 'has a date equal to'),
    operands: 1
  },
  {
    type: Operators.has_date_gt,
    verboseName: i18n.t('operators.has_date_gt', 'has a date after'),
    operands: 1
  },
  {
    type: Operators.has_time,
    verboseName: i18n.t('operators.has_time', 'has a time'),
    operands: 0,
    categoryName: 'Has Time'
  },
  {
    type: Operators.has_group,
    verboseName: i18n.t('operators.has_group', 'is in the group'),
    operands: 1,
    visibility: VISIBILITY_HIDDEN
  },
  {
    type: Operators.has_category,
    verboseName: i18n.t('operators.has_category', 'has the category'),
    operands: 0,
    visibility: VISIBILITY_HIDDEN
  },
  {
    type: Operators.has_phone,
    verboseName: i18n.t('operators.has_phone', 'has a phone number'),
    operands: 0,
    categoryName: i18n.t('operators.has_phone_category', 'Has Phone')
  },
  {
    type: Operators.has_email,
    verboseName: i18n.t('operators.has_email', 'has an email'),
    operands: 0,
    categoryName: i18n.t('operators.has_email_category', 'Has Email')
  },
  {
    type: Operators.has_state,
    verboseName: i18n.t('operators.has_state', 'has state'),
    operands: 0,
    categoryName: i18n.t('operators.has_state_category', 'Has State'),
    filter: FeatureFilter.HAS_LOCATIONS
  },
  {
    type: Operators.has_district,
    verboseName: i18n.t('operators.has_district', 'has district'),
    operands: 1,
    categoryName: i18n.t('operators.has_district_category', 'Has District'),
    filter: FeatureFilter.HAS_LOCATIONS
  },
  {
    type: Operators.has_ward,
    verboseName: i18n.t('operators.has_ward', 'has ward'),
    operands: 2,
    categoryName: i18n.t('operators.has_ward_category', 'Has Ward'),
    filter: FeatureFilter.HAS_LOCATIONS
  },
  {
    type: Operators.has_error,
    verboseName: i18n.t('operators.has_error', 'has an error'),
    operands: 0,
    categoryName: i18n.t('operators.has_error_category', 'Has Error'),
    visibility: VISIBILITY_HIDDEN
  },
  {
    type: Operators.has_value,
    verboseName: i18n.t('operators.has_value', 'is not empty'),
    operands: 0,
    categoryName: i18n.t('operators.has_value_category', 'Not Empty'),
    visibility: VISIBILITY_HIDDEN
  },
  {
    type: Operators.has_pattern,
    verboseName: i18n.t('operators.has_pattern', 'matches regex'),
    operands: 1
  },

  {
    type: Operators.has_media,
    verboseName: i18n.t('operators.has_media', 'has media'),
    operands: 0,
    categoryName: 'Has Media'
  },

  {
    type: Operators.has_audio,
    verboseName: i18n.t('operators.has_audio', 'has audio'),
    operands: 0,
    categoryName: 'Has Audio'
  },

  {
    type: Operators.has_image,
    verboseName: i18n.t('operators.has_image', 'has image'),
    operands: 0,
    categoryName: 'Has Image'
  },

  {
    type: Operators.has_video,
    verboseName: i18n.t('operators.has_video', 'has video'),
    operands: 0,
    categoryName: 'Has Video'
  },

  {
    type: Operators.has_file,
    verboseName: i18n.t('operators.has_file', 'has file'),
    operands: 0,
    categoryName: 'Has File'
  },

  {
    type: Operators.has_location,
    verboseName: i18n.t('operators.has_location', 'has location'),
    operands: 0,
    categoryName: 'Has Location'
  }
];

export const operatorConfigMap: OperatorMap = [...operatorConfigList, ...intentOperatorList].reduce(
  (map: OperatorMap, operatorConfig: Operator) => {
    map[operatorConfig.type] = operatorConfig;
    return map;
  },
  {}
);

/**
 * Shortcut for constant lookup of operator config in operator configs map
 * @param {string} type - The type of the operator config to return, e.g. 'send_msg'
 * @returns {Object} - The operator config found at operatorConfigs[type] or -1
 */
export const getOperatorConfig = (type: Operators): Operator => operatorConfigMap[type];
