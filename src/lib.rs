pub mod avl_tree;
pub mod interval;
pub mod interval_tree;

use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
};

use interval::Interval;
use interval_tree::IntervalTree;
use wasm_bindgen::prelude::*;

use serde_json::Value;

use wasm_bindgen::prelude::*;

// How do we batch our computations?
// Can we just upfront generate a datastructure which organises the intervals sequentially?

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(
    Error, Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash, Debug, Serialize, Deserialize,
)]
pub enum JsIntervalTreeError {
    #[error(transparent)]
    IntervalError(#[from] crate::interval::IntervalError),
}

impl From<JsIntervalTreeError> for JsValue {
    fn from(value: JsIntervalTreeError) -> Self {
        match value {
            JsIntervalTreeError::IntervalError(err) => {
                JsValue::from_str(&format!("IntervalError: {}", err))
            }
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct JsInterval {
    start: i32,
    end: i32,
}
impl From<Interval<i32>> for JsInterval {
    fn from(value: Interval<i32>) -> Self {
        Self {
            start: value.start,
            end: value.end,
        }
    }
}
impl TryFrom<JsInterval> for Interval<i32> {
    type Error = crate::interval::IntervalError;
    fn try_from(value: JsInterval) -> Result<Self, Self::Error> {
        let iv = Interval::new(value.start..value.end)?;
        Ok(iv)
    }
}

#[wasm_bindgen]
impl JsInterval {
    #[wasm_bindgen(constructor)]
    pub fn new(start: i32, end: i32) -> Self {
        Self { start, end }
    }
    #[wasm_bindgen(getter)]
    pub fn start(&self) -> i32 {
        self.start
    }
    #[wasm_bindgen(getter)]
    pub fn end(&self) -> i32 {
        self.end
    }
}

#[wasm_bindgen]
pub struct JsIntervalTree(IntervalTree<i32, JsValue>);

impl From<IntervalTree<i32, JsValue>> for JsIntervalTree {
    fn from(value: IntervalTree<i32, JsValue>) -> Self {
        Self(value)
    }
}

// impl Deref for JsIntervalTree {
//     type Target = IntervalTree<i32, Value>;
//     fn deref(&self) -> &Self::Target {
//         &self.0
//     }
// }

// impl DerefMut for JsIntervalTree {
//     fn deref_mut(&mut self) -> &mut Self::Target {
//         &mut self.0
//     }
// }

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct JsIntervalData {
    interval: JsInterval,
    #[serde(skip)]
    data: JsValue,
}

#[wasm_bindgen]
impl JsIntervalData {
    #[wasm_bindgen(getter)]
    pub fn interval(&self) -> JsInterval {
        self.interval
    }

    #[wasm_bindgen(getter)]
    pub fn data(&self) -> JsValue {
        self.data.clone()
    }
}

#[wasm_bindgen]
pub struct JsBatchedIntervalData(HashMap<JsInterval, Vec<JsIntervalData>>);

impl From<HashMap<JsInterval, Vec<JsIntervalData>>> for JsBatchedIntervalData {
    fn from(value: HashMap<JsInterval, Vec<JsIntervalData>>) -> Self {
        JsBatchedIntervalData(value)
    }
}

#[wasm_bindgen]
impl JsBatchedIntervalData {
    #[wasm_bindgen(getter)]
    pub fn batch(&self) -> Result<JsValue, JsValue> {
        Ok(serde_wasm_bindgen::to_value(&self.0)?)
    }

    // pub fn query_cache(&mut self, iv: JsInterval) -> Option<Vec<JsIntervalData>> {
    //     let res = self.0.get(&iv).map(ToOwned::to_owned);

    // }
}

#[wasm_bindgen]
impl JsIntervalTree {
    #[wasm_bindgen(constructor)]
    pub fn new() -> JsIntervalTree {
        IntervalTree::<i32, JsValue>::new().into()
    }
    #[wasm_bindgen]
    pub fn insert(&mut self, iv: JsInterval, data: JsValue) -> Result<(), JsIntervalTreeError> {
        let iv = Interval::try_from(iv)?;

        self.0.insert(iv, data);

        Ok(())
    }
    #[wasm_bindgen]
    pub fn find(&self, iv: JsInterval) -> Result<Vec<JsIntervalData>, JsIntervalTreeError> {
        let iv = Interval::try_from(iv)?;

        let entries = self
            .0
            .find(iv)
            .map(|entry| {
                let iv = entry.interval();

                JsIntervalData {
                    interval: iv.clone().into(),
                    data: entry.data().clone(),
                }
            })
            .collect::<Vec<_>>();

        Ok(entries)
    }
    #[wasm_bindgen]
    pub fn batch_find(
        &self,
        intervals: Vec<i32>,
    ) -> Result<JsBatchedIntervalData, JsIntervalTreeError> {
        let mut cache = HashMap::<JsInterval, Vec<JsIntervalData>>::new();

        for window in intervals.windows(2) {
            match window {
                [start, end, ..] => {
                    let iv = JsInterval {
                        start: *start,
                        end: *end,
                    };
                    let entry = self.find(iv);

                    match entry {
                        Ok(entry) => {
                            cache.insert(iv, entry);
                        }
                        Err(err) => {}
                    }
                }
                _ => {}
            }
        }
        Ok(cache.into())
    }
}
