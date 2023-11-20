use std::{
    cmp::{max, Ordering},
    iter::FromIterator,
    mem,
    ops::Not,
};

use std::{cell::RefCell, collections::VecDeque, rc::Rc};

/**
 * self-balancing binary search tree. In an AVL tree, the heights of the two child subtrees of any node differ
 *  by at most one; if at any time they differ by more than one, rebalancing is done to restore this property.
 */

///Uses:
/// - where lookup is far more common than insertion
trait AvlTree<T> {
    fn insert(&mut self, value: T);
    fn delete(&mut self, value: &T) -> Option<T>;
    fn find(&self, value: &T) -> Option<&T>;
    fn height(&self) -> usize;
    fn is_balanced(&self) -> bool;

    /// Rotations: Rotations are the key to rebalancing the AVL tree. There are four types of rotations:
    /// left, right, left-right, and right-left. These rotations are used to ensure that the tree remains
    /// balanced after insertions and deletions.
    fn rotation(&self) -> () {}
    /// Height Update: After each insertion, deletion, or rotation, the height of the affected nodes needs
    /// to be updated to reflect the current state of the tree.
    fn height_update(&self) -> () {}
    /// Balance Factor Calculation: The balance factor of a node is the difference in height between its left
    /// and right subtrees. This factor is used to decide whether rotations are needed and which type of rotation
    /// to apply.
    fn balance_force_calculation(&self) -> () {}
}

// for recusvie data structure: insert indirection (e.g., a Box, Rc, or &) at some point to make representable

type Link<T> = Option<Box<Node<T>>>;

pub struct Node<T: Ord> {
    height: usize,
    value: T,
    left: Link<T>,
    right: Link<T>,
}

struct DfsIter<'a, T: Ord> {
    /// Use a stack to keep track of the nodes to visit
    /// Stack: last in; first out;
    stack: Vec<&'a Node<T>>,
}

impl<'a, T: Ord> Iterator for DfsIter<'a, T> {
    type Item = &'a Node<T>;
    fn next(&mut self) -> Option<Self::Item> {
        match self.stack.pop() {
            Some(node) => {
                // Push left path of right subtree to stack
                let mut child = &node.right;
                while let Some(subtree) = child {
                    self.stack.push(subtree.as_ref());
                    child = &subtree.left;
                }
                Some(node)
            }
            None => None,
        }
    }
}

impl<'a, T: Ord> Node<T> {
    fn dfs_iter(self) -> DfsIter<'a, T> {
        DfsIter { stack: Vec::new() }
    }
}

struct BfsIter<'a, T: Ord> {
    /// Use a queue to manage the nodes to visit.  
    /// Queue: first in; first out  
    queue: VecDeque<&'a Node<T>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {}
}
